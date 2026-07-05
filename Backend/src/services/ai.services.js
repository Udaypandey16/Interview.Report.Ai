const Groq = require('groq-sdk')

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ_API_KEY is not configured')
    }

    const prompt = `Generate a highly specific, personalized interview report for this exact candidate. Base every question and answer strictly on the details below — do NOT use generic or template questions.

Resume:
${resume || 'Not provided'}

Self Description:
${selfDescription || 'Not provided'}

Job Description:
${jobDescription}

Analyze the actual skills, projects, and experience mentioned above and tailor everything specifically to this candidate and this job.`

    const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 8000,
        top_p: 0.9,
        messages: [
            {
                role: 'system',
                content: `You are an expert interview coach. Return ONLY a valid JSON object with EXACTLY this structure:
{
  "matchScore": <number 0-100>,
  "technicalQuestions": [{"question": "...", "intention": "...", "answer": "..."}],
  "behavioralQuestions": [{"question": "...", "intention": "...", "answer": "..."}],
  "skillGap": [{"skill": "...", "severity": "low|medium|high"}],
  "roadmap": [{"day": 1, "focus": "...", "tasks": ["...", "..."]}],
  "title": "..."
}
IMPORTANT RULES:
- Questions MUST be specific to the candidate's actual resume, projects, and the job description provided. Do NOT generate generic textbook questions.
- technicalQuestions: minimum 5-6 questions, directly referencing specific skills/projects/technologies mentioned in the resume or job description
- behavioralQuestions: minimum 4-5 questions, based on the candidate's actual experience and role requirements
- Each "answer" field MUST be detailed and complete — minimum 4-6 sentences, written as a strong model answer the candidate could actually give. Do not write short or one-line answers.
- Each "intention" field must explain in 1-2 sentences why an interviewer asks this specific question for this specific candidate/role
- skillGap: cover all relevant skills missing or weak based on job description vs resume
- roadmap: minimum 7 days plan, each day minimum 4-5 concrete, actionable tasks
- Vary question phrasing and topics each time — avoid repeating the same standard questions across different candidates
Return ONLY JSON. No markdown, no explanation, nothing else.`,
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        response_format: { type: 'json_object' },
    })

    const rawContent = response.choices?.[0]?.message?.content

    if (!rawContent) {
        throw new Error('AI response was empty')
    }

    const result = JSON.parse(rawContent)
    const roadmap = result.roadmap || result.preparationPlan || []

    return {
        ...result,
        roadmap,
        preparationPlan: roadmap,
        title: result.title || 'Interview Strategy',
    }
}

module.exports = generateInterviewReport