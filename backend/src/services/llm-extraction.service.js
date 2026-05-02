class LlmExtractionService {
  async extractStructuredProfile({ resumeText, roleTitle }) {
    return {
      fullName: null,
      email: null,
      phone: null,
      skills: [],
      experienceYears: 0,
      projects: [],
      metadata: {
        model: "gemini-pro",
        roleTitle,
        resumeCharacters: resumeText.length,
      },
    };
  }
}

export const llmExtractionService = new LlmExtractionService();
