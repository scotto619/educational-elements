// pages/api/generate-quiz.js - AI Quiz Generator using Google Gemini API (free tier)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, gradeLevel, numQuestions = 10, difficulty = 'medium' } = req.body;

  if (!topic || typeof topic !== 'string' || topic.trim().length < 2) {
    return res.status(400).json({ error: 'A valid topic is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'AI generator not configured. Please add GEMINI_API_KEY to your environment variables.',
      setupRequired: true
    });
  }

  const safeTopic = topic.trim().slice(0, 200);
  const safeNum = Math.min(Math.max(parseInt(numQuestions, 10) || 10, 3), 20);
  const safeGrade = gradeLevel || 'Primary school (Years 3-6)';
  const safeDifficulty = ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium';

  const prompt = `You are an expert educational quiz creator. Generate ${safeNum} multiple-choice quiz questions about "${safeTopic}" suitable for ${safeGrade} students at ${safeDifficulty} difficulty level.

RULES:
- Each question must have exactly 4 answer options (A, B, C, D)
- Only ONE answer is correct
- Questions should be clear, educational, and age-appropriate
- Vary the position of the correct answer (don't always put it first)
- For ${safeDifficulty} difficulty: ${safeDifficulty === 'easy' ? 'use simple concepts and clear language' : safeDifficulty === 'medium' ? 'require some knowledge and reasoning' : 'require deep understanding and critical thinking'}

Return ONLY valid JSON in this exact format, no other text:
{
  "title": "Quiz title about the topic",
  "description": "Brief engaging description (1 sentence)",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "timeLimit": 20,
      "explanation": "Brief explanation of why this is correct"
    }
  ]
}

The correctAnswer field is a 0-based index (0=first option, 1=second, 2=third, 3=fourth).
Time limits should be 15-30 seconds based on question complexity.`;

  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ]
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', response.status, errData);
      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limit reached. Please wait a moment and try again.' });
      }
      if (response.status === 401 || response.status === 403) {
        return res.status(401).json({ error: 'Invalid API key. Please check your GEMINI_API_KEY.' });
      }
      return res.status(500).json({ error: 'AI service error. Please try again.' });
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(500).json({ error: 'No response from AI. Please try again.' });
    }

    // Extract JSON from the response (handle markdown code blocks)
    let jsonText = rawText.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1].trim();
    }

    let quizData;
    try {
      quizData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw text:', rawText.substring(0, 500));
      return res.status(500).json({ error: 'AI returned invalid format. Please try again.' });
    }

    // Validate and clean the quiz data
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      return res.status(500).json({ error: 'AI returned incomplete quiz. Please try again.' });
    }

    const cleanedQuestions = quizData.questions
      .filter(q => q.question && Array.isArray(q.options) && q.options.length === 4)
      .map((q, index) => ({
        id: `ai_${Date.now()}_${index}`,
        question: String(q.question).trim(),
        type: 'multiple_choice',
        options: q.options.map(o => String(o).trim()),
        correctAnswer: Math.min(Math.max(parseInt(q.correctAnswer, 10) || 0, 0), 3),
        timeLimit: Math.min(Math.max(parseInt(q.timeLimit, 10) || 20, 10), 60),
        points: 1000,
        explanation: q.explanation ? String(q.explanation).trim() : '',
        aiGenerated: true
      }));

    if (cleanedQuestions.length === 0) {
      return res.status(500).json({ error: 'Could not generate valid questions. Please try a different topic.' });
    }

    return res.status(200).json({
      success: true,
      quiz: {
        title: String(quizData.title || `${safeTopic} Quiz`).trim(),
        description: String(quizData.description || `AI-generated quiz about ${safeTopic}`).trim(),
        category: 'general',
        questions: cleanedQuestions,
        aiGenerated: true,
        topic: safeTopic,
        gradeLevel: safeGrade,
        difficulty: safeDifficulty
      }
    });

  } catch (error) {
    console.error('generate-quiz error:', error);
    return res.status(500).json({ error: 'Failed to generate quiz. Please try again.' });
  }
}
