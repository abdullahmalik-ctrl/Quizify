const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const parseError = async (response) => {
  const fallback = `Request failed (${response.status})`;
  try {
    const data = await response.json();
    return data?.error || fallback;
  } catch {
    return fallback;
  }
};

const postJson = async (path, payload) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
};

export const generateWithGemini = async (content, config, mode, providedKey, providedModel) => {
  return postJson('/api/generate', {
    content,
    config,
    mode,
    apiKey: providedKey || undefined,
    model: providedModel || undefined,
  });
};

export const gradeWithGemini = async (paper, textAnswers, mcqAnswers, vibeCheck = false, providedKey, providedModel) => {
  return postJson('/api/grade', {
    paper,
    textAnswers,
    mcqAnswers,
    vibeCheck,
    apiKey: providedKey || undefined,
    model: providedModel || undefined,
  });
};

export const checkApiKey = async (key) => {
  try {
    const payload = key ? { apiKey: key } : {};
    const result = await postJson('/api/verify-key', payload);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};
