import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = Number(process.env.API_PORT || 8787);
const defaultModel = process.env.GEMINI_MODEL || 'models/gemini-3.0-flash';
const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;
const modelCache = new Map();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '2mb' }));

const safetySettings = [
  { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
];

const cleanJson = (text) => {
  if (!text) return null;
  let cleaned = text.replace(/```json\n?|```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1) return null;
  cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  cleaned = cleaned.replace(/(^|[^\\:])\/\/.*$/gm, '$1');
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

  try {
    return JSON.parse(cleaned);
  } catch {
    try {
      let fixed = cleaned;
      fixed = fixed.replace(/([{,]\s*)([a-zA-Z0-9_]+?)\s*:/g, '$1"$2":');
      fixed = fixed.replace(/([{,]\s*)'([a-zA-Z0-9_]+?)'\s*:/g, '$1"$2":');
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
      fixed = fixed.replace(/(\\["\\\/bfnrt]|\\u[0-9a-fA-F]{4})|(\\)/g, (match, validGroup) => {
        if (validGroup) return validGroup;
        return '\\\\';
      });
      return JSON.parse(fixed);
    } catch {
      return null;
    }
  }
};

const fetchWithRetry = async (url, options, retries = 3, delay = 2000) => {
  try {
    const response = await fetch(url, options);

    if (response.status === 429 || response.status === 503) {
      const retryAfter = response.headers.get('Retry-After');
      let waitTime = delay;

      if (retryAfter) {
        waitTime = (parseInt(retryAfter, 10) + 1) * 1000;
      }

      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        const nextDelay = retryAfter ? delay : delay * 2;
        return fetchWithRetry(url, options, retries - 1, nextDelay);
      }
    }

    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
};

const resolveApiKey = (providedKey) => {
  const key = providedKey || process.env.GEMINI_API_KEY;
  if (!key) {
    const err = new Error('No Gemini API key configured on server. Set GEMINI_API_KEY in .env or provide apiKey in request.');
    err.status = 400;
    throw err;
  }
  return key;
};

const resolveModel = (providedModel) => {
  const model = providedModel || defaultModel;
  return model.startsWith('models/') ? model : `models/${model}`;
};

const scoreModelName = (modelName = '') => {
  const name = modelName.toLowerCase();
  if (name.includes('gemini-3.0-flash')) return 110;
  if (name.includes('gemini-3.0-pro')) return 105;
  if (name.includes('gemini-2.5-flash')) return 100;
  if (name.includes('gemini-2.0-flash')) return 95;
  if (name.includes('gemini-1.5-flash')) return 90;
  if (name.includes('gemini-2.5-pro')) return 80;
  if (name.includes('gemini-2.0-pro')) return 75;
  if (name.includes('gemini-1.5-pro')) return 80;
  if (name.includes('gemini-pro')) return 60;
  if (name.includes('flash')) return 50;
  return 10;
};

const getGenerateContentModels = async (apiKey) => {
  const now = Date.now();
  const cached = modelCache.get(apiKey);
  if (cached && now - cached.ts < MODEL_CACHE_TTL_MS) {
    return cached.models;
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  if (!response.ok) {
    const err = new Error('Failed to fetch models list for this API key.');
    err.status = 400;
    throw err;
  }

  const data = await response.json();
  const models = (data.models || [])
    .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
    .map((m) => ({ name: m.name, displayName: m.displayName || m.name }))
    .sort((a, b) => scoreModelName(b.name) - scoreModelName(a.name));

  modelCache.set(apiKey, { ts: now, models });
  return models;
};

const resolveBestModel = async (apiKey, preferredModel) => {
  const normalizedPreferred = preferredModel ? resolveModel(preferredModel) : null;
  const models = await getGenerateContentModels(apiKey);

  if (models.length === 0) {
    const err = new Error('No generateContent-capable Gemini models available for this API key.');
    err.status = 400;
    throw err;
  }

  if (normalizedPreferred && models.some((m) => m.name === normalizedPreferred)) {
    return normalizedPreferred;
  }

  return models[0].name;
};

const callGemini = async ({ model, apiKey, body }) => {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;
  const response = await fetchWithRetry(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || response.statusText || String(response.status);
    const err = new Error(`Gemini API error: ${message}`);
    err.status = response.status;
    throw err;
  }

  return response.json();
};

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'quizify-api',
    defaultModel,
    hasServerKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.post('/api/verify-key', async (req, res, next) => {
  try {
    const apiKey = resolveApiKey(req.body?.apiKey);
    const modelId = await resolveBestModel(apiKey, req.body?.model || defaultModel);
    const models = await getGenerateContentModels(apiKey);
    const selectedModel = models.find((m) => m.name === modelId) || models[0];

    res.json({
      success: true,
      modelId,
      displayName: selectedModel?.displayName || modelId || 'Gemini',
      usingServerDefaultKey: !req.body?.apiKey,
    });
  } catch (error) {
    next(error);
  }
});

app.post('/api/generate', async (req, res, next) => {
  try {
    const { content, config, mode, apiKey: providedKey, model: providedModel } = req.body || {};
    if (!content || !String(content).trim()) {
      const err = new Error('Input content is required.');
      err.status = 400;
      throw err;
    }

    const apiKey = resolveApiKey(providedKey);
    const model = await resolveBestModel(apiKey, providedModel || defaultModel);

    const safeConfig = {
      specificTopic: config?.specificTopic || '',
      difficulty: config?.difficulty || 'medium',
      sections: config?.sections || [],
    };

    const promptContext =
      mode === 'topic'
        ? `TOPIC: "${content}"\nAdditional Focus Areas: ${safeConfig.specificTopic || 'None'}`
        : `CONTEXT TEXT:\n${String(content).substring(0, 300000)}\nFocus Areas: ${safeConfig.specificTopic || 'None'}`;

    const sectionInstructions = safeConfig.sections
      .map(
        (s, i) =>
          `${i + 1}. **Section ID: "${s.id}"** (${s.title}): Generate exactly ${s.count} questions. Each worth ${s.marks} marks. Type: ${s.type === 'mcq' ? 'Multiple Choice (4 plausible options)' : 'Subjective/Text based'}.`
      )
      .join('\n  ');

    const systemContext =
      mode === 'topic'
        ? `You are an expert academic examiner. Difficulty: ${safeConfig.difficulty.toUpperCase()}. Generate a comprehensive exam based on the following structure.`
        : `You are a strict academic exam generator. Difficulty: ${safeConfig.difficulty.toUpperCase()}. Your task is to generate questions ONLY from the provided CONTEXT TEXT. You must NOT use any external knowledge. If the answer to a question cannot be found directly in the text or derived from it, DO NOT ask that question. Ensure all answers are typically contained within the source material. IMPORTANT: Analyze the ENTIRE provided text from beginning to end. Distribute the questions evenly across the entire document, ensuring you cover topics from the start, middle, and end. Do not focus only on the first few pages.`;

    const systemPrompt = `${systemContext}

REQUIRED EXAM STRUCTURE:
${sectionInstructions}

Output Format (JSON ONLY):
{
  "sections": [
    {
      "id": "Must match the Section ID from instructions exactly (e.g., '${safeConfig.sections[0]?.id}')",
      "title": "The display title of the section",
      "questions": [
        {
          "id": "unique_string_id",
          "question": "Question text. Use LaTeX with double escaped backslashes for math: $E=mc^2$ or $\\\\Delta t$.",
          "options": ["Option text 1", "Option text 2", ...],
          "answer": "Exact correct answer text",
          "answerKey": "Brief bullet points of expected answer (for subjective) or explanation (for mcq)",
          "marks": number
        }
      ]
    }
  ]
}

Requirements:
1. Strictly follow the count and marks for each section.
2. JSON must be valid. Do not include comments in the JSON.
3. MATH FORMULAS: You MUST use double backslashes for LaTeX commands inside the JSON string.
   - CORRECT: "$\\\\alpha + \\\\beta$"
4. Use strictly academic tone.
5. EXTREMELY IMPORTANT: For Document Mode, ignore your general knowledge. Questions must be answerable solely using the provided CONTEXT TEXT.
6. Scan the WHOLE document. Ensure questions are NOT clustered at the start.
`;

    const result = await callGemini({
      model,
      apiKey,
      body: {
        contents: [{ parts: [{ text: promptContext }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
        safetySettings,
      },
    });

    if (result.promptFeedback?.blockReason) {
      const err = new Error(`AI synthesis blocked: ${result.promptFeedback.blockReason}.`);
      err.status = 422;
      throw err;
    }

    const candidate = result.candidates?.[0];
    if (!candidate || candidate.finishReason === 'SAFETY' || candidate.finishReason === 'RECITATION') {
      const err = new Error(`AI synthesis interrupted (${candidate?.finishReason || 'Unknown'}).`);
      err.status = 422;
      throw err;
    }

    const parsed = cleanJson(candidate.content?.parts?.[0]?.text);
    if (!parsed?.sections) {
      const err = new Error('The AI returned a non-compliant structure.');
      err.status = 502;
      throw err;
    }

    res.json(parsed);
  } catch (error) {
    next(error);
  }
});

app.post('/api/grade', async (req, res, next) => {
  try {
    const {
      paper,
      textAnswers,
      mcqAnswers,
      vibeCheck = false,
      apiKey: providedKey,
      model: providedModel,
    } = req.body || {};

    const apiKey = resolveApiKey(providedKey);
    const model = await resolveBestModel(apiKey, providedModel || defaultModel);

    const allQuestions = [];
    if (paper?.sections) {
      paper.sections.forEach((section) => {
        if (section.questions) {
          section.questions.forEach((q) => {
            const isMcq = q.options && q.options.length > 0;
            allQuestions.push({
              id: q.id,
              type: isMcq ? 'MCQ' : 'Written',
              question: q.question,
              options: isMcq ? q.options : undefined,
              correctAnswer: q.answer,
              studentAnswer: (isMcq ? mcqAnswers?.[q.id] : textAnswers?.[q.id]) || '(Not Answered)',
              maxMarks: q.marks,
              correctContext: q.answerKey,
            });
          });
        }
      });
    }

    if (allQuestions.length === 0) {
      res.json({ results: {}, summary: 'No questions to evaluate.' });
      return;
    }

    const prompt = `
Role: ${vibeCheck ? 'A harsh, Gen Z examiner who uses slang (like mid, cap, cooked) and roasts students for mistakes' : 'A strict, high-standard Academic Examiner'}.
Task: Evaluate the student's answers with extreme precision. Mimic a real professor marking a physical paper.

Grading Rules:
1. General Summary: Provide a "general_feedback" field. This is a 2-3 sentence handwritten note at the top of the paper. Critically assess their performance. Tell them WHY they need to practice more if they missed easy questions or left things blank.
2. Unattempted Questions: If 'studentAnswer' is "(Not Answered)" or "(No answer provided)":
   - Score is 0.
   - Feedback MUST state: "Not Attempted." followed by a brief explanation of the concept they missed.
   - Provide the FULL correct answer in 'correction'.
3. Objective (MCQs): If incorrect/unanswered, explain WHY the student's choice (or lack thereof) is wrong and why the correct answer is correct.
4. Subjective (Written): Compare strictly against "correctContext" and penalize vagueness.

Input Data: ${JSON.stringify(allQuestions)}

Output Format (JSON ONLY):
{
  "summary": "Overall professor comment here...",
  "results": {
    "question_id": {
      "score": number,
      "feedback": "Strict critique${vibeCheck ? ' with roasting/slang' : ' in professional tone'}",
      "correction": "The ideal, concise answer"
    }
  }
}
`;

    const result = await callGemini({
      model,
      apiKey,
      body: {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
        safetySettings,
      },
    });

    const parsed = cleanJson(result.candidates?.[0]?.content?.parts?.[0]?.text);
    res.json(parsed || { results: {}, summary: 'Evaluation incomplete.' });
  } catch (error) {
    next(error);
  }
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || 'Unexpected server error.';
  res.status(status).json({ error: message });
});

app.listen(port, () => {
  console.log(`Quizify API running on http://localhost:${port}`);
});
