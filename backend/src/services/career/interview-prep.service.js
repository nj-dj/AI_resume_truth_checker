import { generateStructuredJson } from "../ai/structured-json.js";

class InterviewPrepService {
  async generateSession({ roleTitle, level = "mid", interviewType = "mixed", focusAreas = [] }) {
    const data = await generateStructuredJson({
      purpose: "interview_prep",
      prompt: `You are a hiring manager and interview coach.

Return ONLY JSON:
{
  "technical_questions": [{"question": "", "follow_up": ""}],
  "hr_questions": [{"question": "", "follow_up": ""}],
  "preparation_checklist": ["string"]
}

Role: ${roleTitle}
Seniority: ${level}
Interview type: ${interviewType}
Focus areas: ${JSON.stringify(focusAreas)}
`,
    });

    return {
      success: true,
      data: {
        technicalQuestions: Array.isArray(data.technical_questions) ? data.technical_questions : [],
        hrQuestions: Array.isArray(data.hr_questions) ? data.hr_questions : [],
        preparationChecklist: Array.isArray(data.preparation_checklist) ? data.preparation_checklist : [],
      },
    };
  }

  async feedbackOnAnswer({ question, answer, roleTitle }) {
    const data = await generateStructuredJson({
      purpose: "interview_feedback",
      prompt: `Return ONLY JSON:
{
  "strengths": ["string"],
  "improvements": ["string"],
  "model_answer_outline": ["string"],
  "confidence_score": number,
  "confidence_rationale": ""
}

Role context: ${roleTitle}
Question: ${question}
Candidate answer: ${answer}

confidence_score is 0-100 based on structure, specificity, and relevance (not charisma).
`,
    });

    return {
      success: true,
      data: {
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        improvements: Array.isArray(data.improvements) ? data.improvements : [],
        modelAnswerOutline: Array.isArray(data.model_answer_outline) ? data.model_answer_outline : [],
        confidenceScore: Number.isFinite(data.confidence_score) ? Math.max(0, Math.min(100, Math.round(data.confidence_score))) : 0,
        confidenceRationale: typeof data.confidence_rationale === "string" ? data.confidence_rationale : "",
      },
    };
  }
}

export const interviewPrepService = new InterviewPrepService();
