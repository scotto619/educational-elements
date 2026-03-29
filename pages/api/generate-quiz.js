// pages/api/generate-quiz.js
// Uses Pollinations AI - completely free, no API key required
// Multiple models + retry logic for reliability

const MODELS = ['openai', 'mistral', 'llama'];
const TIMEOUT_MS = 30000;

function makePrompt(topic, numQ, gradeLevel, difficulty) {
  const difficultyGuide = difficulty === 'easy'
    ? 'simple language and straightforward concepts students would likely know'
    : difficulty === 'hard'
    ? 'challenging questions requiring deeper thinking and specific knowledge'
    : 'moderate difficulty requiring some knowledge but not too specialised';

  return `Create ${numQ} multiple-choice quiz questions about "${topic}" for ${gradeLevel} students. Difficulty: ${difficulty} (${difficultyGuide}).

Rules:
- Each question has exactly 4 answer options
- Only one answer is correct
- Questions must be educational and age-appropriate
- Vary which position the correct answer is in (0=first, 1=second, 2=third, 3=fourth)
- correctAnswer is a 0-based index (0, 1, 2, or 3)

Return ONLY this exact JSON structure with no other text:
{
  "title": "Short quiz title",
  "description": "One sentence description",
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1,
      "timeLimit": 20
    }
  ]
}`;
}

async function fetchWithTimeout(url, options, ms = TIMEOUT_MS) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

async function tryPostModel(model, prompt) {
  const res = await fetchWithTimeout('https://text.pollinations.ai/openai/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are an expert educational quiz creator. Always respond with valid JSON only, no markdown.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      seed: Math.floor(Math.random() * 10000)
    })
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || data?.text || '';
  if (!text) throw new Error('Empty response');
  return text;
}

async function tryGetFallback(prompt) {
  const res = await fetchWithTimeout(
    `https://text.pollinations.ai/${encodeURIComponent(prompt)}`,
    { method: 'GET', headers: { Accept: 'text/plain' } }
  );
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (!text) throw new Error('Empty response');
  return text;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { topic, gradeLevel, numQuestions = 10, difficulty = 'medium' } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
    return res.status(400).json({ error: 'A valid topic is required' });
  }

  const safeTopic = topic.trim().slice(0, 200);
  const safeNum = Math.min(Math.max(parseInt(numQuestions, 10) || 10, 3), 20);
  const safeGrade = gradeLevel || 'Primary school (Years 3-6)';
  const safeDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';

  const prompt = makePrompt(safeTopic, safeNum, safeGrade, safeDifficulty);

  let lastError = null;

  // Try each model in sequence (POST endpoint)
  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    try {
      if (i > 0) await sleep(800); // brief pause between attempts
      const rawText = await tryPostModel(model, prompt);
      const result = buildResponse(rawText, safeTopic, safeGrade, safeDifficulty);
      if (result) return res.status(200).json({ success: true, quiz: result });
    } catch (err) {
      lastError = err;
      // continue to next model
    }
  }

  // Final fallback: GET endpoint
  try {
    await sleep(500);
    const rawText = await tryGetFallback(prompt);
    const result = buildResponse(rawText, safeTopic, safeGrade, safeDifficulty);
    if (result) return res.status(200).json({ success: true, quiz: result });
  } catch (err) {
    lastError = err;
  }

  console.error('All AI attempts failed:', lastError?.message);
  return res.status(503).json({
    error: 'The AI service is busy right now. Please wait a few seconds and try again.'
  });
}

function buildResponse(rawText, topic, gradeLevel, difficulty) {
  let jsonText = rawText.trim();

  // Strip markdown code fences
  const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) jsonText = fenceMatch[1].trim();

  // Extract first JSON object
  const objMatch = jsonText.match(/\{[\s\S]*\}/);
  if (objMatch) jsonText = objMatch[0];

  let quizData;
  try {
    quizData = JSON.parse(jsonText);
  } catch {
    return null; // signal caller to try next
  }

  if (!quizData?.questions || !Array.isArray(quizData.questions)) return null;

  const cleanedQuestions = quizData.questions
    .filter(q => q?.question && Array.isArray(q.options) && q.options.length >= 4)
    .map((q, i) => ({
      id: `ai_${Date.now()}_${i}`,
      question: String(q.question).trim(),
      type: 'multiple_choice',
      options: q.options.slice(0, 4).map(o => String(o).trim()),
      correctAnswer: Math.min(Math.max(parseInt(q.correctAnswer ?? 0, 10), 0), 3),
      timeLimit: Math.min(Math.max(parseInt(q.timeLimit, 10) || 20, 10), 60),
      points: 1000,
      aiGenerated: true
    }));

  if (cleanedQuestions.length === 0) return null;

  return {
    title: String(quizData.title || `${topic} Quiz`).trim(),
    description: String(quizData.description || `AI-generated quiz about ${topic}`).trim(),
    category: 'general',
    questions: cleanedQuestions,
    aiGenerated: true,
    topic,
    gradeLevel,
    difficulty
  };
}
