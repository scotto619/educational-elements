// pages/api/generate-quiz.js
// Uses Pollinations AI - completely free, no API key required

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, gradeLevel, numQuestions = 10, difficulty = 'medium' } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
    return res.status(400).json({ error: 'A valid topic is required' });
  }

  const safeTopic = topic.trim().slice(0, 200);
  const safeNum = Math.min(Math.max(parseInt(numQuestions, 10) || 10, 3), 20);
  const safeGrade = gradeLevel || 'Primary school (Years 3-6)';
  const safeDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';

  const difficultyGuide = safeDifficulty === 'easy'
    ? 'simple language and straightforward concepts that students would likely know'
    : safeDifficulty === 'hard'
    ? 'challenging questions requiring deeper thinking and specific knowledge'
    : 'moderate difficulty requiring some knowledge but not too specialised';

  const prompt = `Create ${safeNum} multiple-choice quiz questions about "${safeTopic}" for ${safeGrade} students. Difficulty: ${safeDifficulty} (${difficultyGuide}).

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

  try {
    // Pollinations AI - completely free, no API key
    const pollinationsRes = await fetch('https://text.pollinations.ai/openai/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational quiz creator. Always respond with valid JSON only, no markdown.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        seed: Math.floor(Math.random() * 10000)
      })
    });

    if (!pollinationsRes.ok) {
      // Fallback: try the simpler GET endpoint
      return await handleGetFallback(safeTopic, safeNum, safeGrade, safeDifficulty, prompt, res);
    }

    const data = await pollinationsRes.json();
    const rawText = data?.choices?.[0]?.message?.content || data?.text || '';

    if (!rawText) {
      return await handleGetFallback(safeTopic, safeNum, safeGrade, safeDifficulty, prompt, res);
    }

    return parseAndRespond(rawText, safeTopic, safeGrade, safeDifficulty, res);

  } catch (err) {
    // Try fallback on any network error
    try {
      return await handleGetFallback(safeTopic, safeNum, safeGrade, safeDifficulty, prompt, res);
    } catch (fallbackErr) {
      console.error('Both AI methods failed:', fallbackErr);
      return res.status(500).json({ error: 'AI quiz generation temporarily unavailable. Please try again in a moment.' });
    }
  }
}

// Fallback: Use the simpler Pollinations text endpoint
async function handleGetFallback(topic, numQ, gradeLevel, difficulty, prompt, res) {
  const encodedPrompt = encodeURIComponent(prompt);
  const textRes = await fetch(`https://text.pollinations.ai/${encodedPrompt}`, {
    method: 'GET',
    headers: { 'Accept': 'text/plain' }
  });

  if (!textRes.ok) {
    throw new Error(`Pollinations fallback failed: ${textRes.status}`);
  }

  const rawText = await textRes.text();
  return parseAndRespond(rawText, topic, gradeLevel, difficulty, res);
}

function parseAndRespond(rawText, topic, gradeLevel, difficulty, res) {
  let jsonText = rawText.trim();

  // Strip markdown code blocks if present
  const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1].trim();
  }

  // Try to extract JSON object from text
  const objMatch = jsonText.match(/\{[\s\S]*\}/);
  if (objMatch) {
    jsonText = objMatch[0];
  }

  let quizData;
  try {
    quizData = JSON.parse(jsonText);
  } catch (parseErr) {
    console.error('JSON parse error. Raw text snippet:', rawText.substring(0, 300));
    return res.status(500).json({
      error: 'AI returned an unexpected format. Please try again — this sometimes happens with complex topics.'
    });
  }

  if (!quizData.questions || !Array.isArray(quizData.questions)) {
    return res.status(500).json({ error: 'AI returned incomplete quiz data. Please try again.' });
  }

  const cleanedQuestions = quizData.questions
    .filter(q => q && q.question && Array.isArray(q.options) && q.options.length >= 4)
    .map((q, index) => ({
      id: `ai_${Date.now()}_${index}`,
      question: String(q.question).trim(),
      type: 'multiple_choice',
      options: q.options.slice(0, 4).map(o => String(o).trim()),
      correctAnswer: Math.min(Math.max(parseInt(q.correctAnswer ?? 0, 10), 0), 3),
      timeLimit: Math.min(Math.max(parseInt(q.timeLimit, 10) || 20, 10), 60),
      points: 1000,
      aiGenerated: true
    }));

  if (cleanedQuestions.length === 0) {
    return res.status(500).json({
      error: 'Could not generate valid questions for this topic. Try a different or more specific topic.'
    });
  }

  return res.status(200).json({
    success: true,
    quiz: {
      title: String(quizData.title || `${topic} Quiz`).trim(),
      description: String(quizData.description || `AI-generated quiz about ${topic}`).trim(),
      category: 'general',
      questions: cleanedQuestions,
      aiGenerated: true,
      topic,
      gradeLevel,
      difficulty
    }
  });
}
