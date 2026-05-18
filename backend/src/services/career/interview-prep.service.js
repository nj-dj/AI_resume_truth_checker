import { generateStructuredJson } from "../ai/structured-json.js";

class InterviewPrepService {
  async generateSession({ roleTitle, level = "mid", interviewType = "mixed", focusAreas = [] }) {
    const data = await generateStructuredJson({
      purpose: "interview_prep",
      fallbackData: this.buildFallbackSession({ roleTitle, level, interviewType }),
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
      fallbackData: this.buildFallbackFeedback({ question, answer, roleTitle }),
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

  buildFallbackSession({ roleTitle, level, interviewType }) {
    const role = roleTitle || "the target role";
    const seniority = level || "mid";

    return {
      technical_questions:
        interviewType === "hr"
          ? []
          : [
              {
                question: `Describe a complex ${role} project you worked on. What trade-offs did you make?`,
                follow_up: "How did you measure whether the solution was successful?",
              },
              {
                question: `How would you debug a production issue in a ${role} workflow?`,
                follow_up: "What signals would you check first?",
              },
              {
                question: `Explain a technical decision you would expect from a ${seniority} ${role}.`,
                follow_up: "What alternatives would you compare before choosing?",
              },
            ],
      hr_questions:
        interviewType === "technical"
          ? []
          : [
              {
                question: "Tell me about a time you received critical feedback and improved your work.",
                follow_up: "What changed in your process afterward?",
              },
              {
                question: "Describe a time you had to align with a stakeholder who disagreed with your approach.",
                follow_up: "How did you keep the conversation productive?",
              },
              {
                question: "What kind of team environment helps you do your best work?",
                follow_up: "How do you adapt when that environment is not available?",
              },
            ],
      preparation_checklist: [
        "Prepare 3-4 concrete examples using the situation, task, action, result format.",
        "Review the target company, product, and role requirements.",
        "Practice explaining recent projects with trade-offs, impact, and collaboration details.",
        "Keep answers specific, concise, and tied to evidence.",
      ],
    };
  }

  buildFallbackFeedback({ question, answer, roleTitle }) {
    const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
    const confidence = Math.max(35, Math.min(82, Math.round(wordCount * 1.8)));

    return {
      strengths: [
        "You provided a direct response to the question.",
        roleTitle ? `The answer can be framed more clearly around the ${roleTitle} role.` : "The answer can be framed more clearly around the target role.",
      ],
      improvements: [
        "Add a specific example with context, action, and measurable result.",
        "Name the tools, stakeholders, or constraints involved.",
        "Close with what you learned or how the experience improved your future work.",
      ],
      model_answer_outline: [
        `Restate the core question: ${question}`,
        "Give a short situation and task.",
        "Explain your specific action and reasoning.",
        "Share the result, metric, or learning.",
      ],
      confidence_score: confidence,
      confidence_rationale: "Local fallback score based on answer length and structure because the AI provider was unavailable.",
    };
  }
}

export const interviewPrepService = new InterviewPrepService();
