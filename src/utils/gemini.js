
const apiKey = "AIzaSyCxMU4HO-rCJRr9dwLGdz5p2x3lrjGEs8k"; // API Key provided by user

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
    } catch (e) {
        try {
            let fixed = cleaned;
            fixed = fixed.replace(/([{,]\s*)([a-zA-Z0-9_]+?)\s*:/g, '$1"$2":');
            fixed = fixed.replace(/([{,]\s*)'([a-zA-Z0-9_]+?)'\s*:/g, '$1"$2":');
            fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
            fixed = fixed.replace(/(\\["\\\/bfnrt]|\\u[0-9a-fA-F]{4})|(\\)/g, (match, validGroup, badGroup) => {
                if (validGroup) return validGroup;
                return "\\\\";
            });
            return JSON.parse(fixed);
        } catch (e2) {
            console.error("JSON Repair Failed:", e2);
            return null;
        }
    }
};
const fetchWithRetry = async (url, options, retries = 6, delay = 2000) => {
    try {
        const response = await fetch(url, options);

        // Handle Rate Limiting (429) or Server Overload (503)
        if (response.status === 429 || response.status === 503) {
            const retryAfter = response.headers.get('Retry-After');
            let waitTime = delay;

            // If the server tells us exactly how long to wait, use that (plus a little buffer)
            if (retryAfter) {
                waitTime = (parseInt(retryAfter, 10) + 1) * 1000;
            }

            if (retries > 0) {
                console.warn(`Rate limit hit. Waiting ${waitTime / 1000}s before retry... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                // If we used a specific retry-after, respect it but don't exponential backoff unnecessarily hard
                // Otherwise use exponential backoff
                const nextDelay = retryAfter ? delay : delay * 2;
                return fetchWithRetry(url, options, retries - 1, nextDelay);
            }
        }
        return response;
    } catch (error) {
        if (retries > 0) {
            console.warn(`Network error (${error.message}). Retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWithRetry(url, options, retries - 1, delay * 2);
        }
        throw error;
    }
};

export const generateWithGemini = async (content, config, mode) => {
    const safeConfig = {
        specificTopic: config.specificTopic || '',
        difficulty: config.difficulty || 'medium',
        sections: config.sections || []
    };

    let promptContext = mode === 'topic'
        ? `TOPIC: "${content}"\nAdditional Focus Areas: ${safeConfig.specificTopic || "None"}`
        : `CONTEXT TEXT:\n${content.substring(0, 300000)}\nFocus Areas: ${safeConfig.specificTopic || "None"}`;

    const sectionInstructions = safeConfig.sections.map((s, i) =>
        `${i + 1}. **Section ID: "${s.id}"** (${s.title}): Generate exactly ${s.count} questions. Each worth ${s.marks} marks. Type: ${s.type === 'mcq' ? 'Multiple Choice (4 plausible options)' : 'Subjective/Text based'}.`
    ).join('\n  ');

    let systemContext = mode === 'topic'
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

    try {
        const response = await fetchWithRetry(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptContext }] }],
                    systemInstruction: { parts: [{ text: systemPrompt }] },
                    generationConfig: { responseMimeType: "application/json" }
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText || response.status}`);
        }
        const result = await response.json();
        const parsed = cleanJson(result.candidates?.[0]?.content?.parts?.[0]?.text);
        if (!parsed || !parsed.sections) throw new Error("Empty or invalid response from AI. Please try again.");
        return parsed;
    } catch (error) {
        console.error("AI Generation Failed:", error);
        throw error;
    }
};

export const gradeWithGemini = async (paper, textAnswers, mcqAnswers, vibeCheck = false) => {
    const allQuestions = [];
    if (paper && paper.sections) {
        paper.sections.forEach(section => {
            if (section.questions) {
                section.questions.forEach(q => {
                    const isMcq = q.options && q.options.length > 0;
                    allQuestions.push({
                        id: q.id,
                        type: isMcq ? 'MCQ' : 'Written',
                        question: q.question,
                        options: isMcq ? q.options : undefined,
                        correctAnswer: q.answer,
                        studentAnswer: (isMcq ? mcqAnswers[q.id] : textAnswers[q.id]) || "(Not Answered)",
                        maxMarks: q.marks,
                        correctContext: q.answerKey
                    });
                });
            }
        });
    }

    if (allQuestions.length === 0) return {};

    const prompt = `
    Role: ${vibeCheck ? "A harsh, Gen Z examiner who uses slang (like 'mid', 'cap', 'cooked') and roasts students for mistakes" : "A strict, high-standard Academic Examiner"}.
    Task: Evaluate the student's answers with extreme precision. Mimic a real professor marking a physical paper.
    
    Grading Rules:
    1. **General Summary:** Provide a "general_feedback" field. This is a 2-3 sentence handwritten note at the top of the paper. Critically assess their performance. Tell them WHY they need to practice more if they missed easy questions or left things blank.
    2. **Unattempted Questions:** If 'studentAnswer' is "(Not Answered)" or "(No answer provided)":
       - Score is 0.
       - Feedback MUST state: "Not Attempted." followed by a brief explanation of the concept they missed.
       - Provide the FULL correct answer in 'correction'.
    3. **Objective (MCQs):** - If incorrect/unanswered, explain WHY the student's choice (or lack thereof) is wrong and why the correct answer is correct.
    4. **Subjective (Written):** - Compare strictly against "correctContext".
       - Penalize for vagueness.
    
    Input Data: ${JSON.stringify(allQuestions)}
    
    Output Format (JSON ONLY):
    {
      "summary": "Overall professor comment here...",
      "results": {
        "question_id": {
          "score": number,
          "feedback": "Strict critique${vibeCheck ? " with roasting/slang" : " in professional tone"}",
          "correction": "The ideal, concise answer"
        }
      }
    }
  `;

    try {
        const response = await fetchWithRetry(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } })
            }
        );

        if (!response.ok) throw new Error("Grading failed");
        const result = await response.json();
        const parsed = cleanJson(result.candidates?.[0]?.content?.parts?.[0]?.text);
        return parsed || { results: {}, summary: "Evaluation incomplete." };
    } catch (error) {
        console.error("Grading Error:", error);
        return { results: {}, summary: "Error generating evaluation." };
    }
};
