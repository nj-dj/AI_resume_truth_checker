import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 120000,
});

export const analyzeCandidate = async ({ resumeFile, githubUsername }) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("githubUsername", githubUsername);

  const response = await apiClient.post("/analyze-candidate", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const postAtsScan = async ({ resumeFile, jobDescription }) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("jobDescription", jobDescription);

  const response = await apiClient.post("/career/ats-scan", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const postResumeEnhance = async ({ resumeFile, jobDescription = "", focus = "general" }) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("jobDescription", jobDescription);
  formData.append("focus", focus);

  const response = await apiClient.post("/career/resume-enhance", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const postCoverLetter = async (payload) => {
  const response = await apiClient.post("/career/cover-letter", payload);
  return response.data;
};

export const postCareerInsights = async (payload) => {
  const response = await apiClient.post("/career/career-insights", payload);
  return response.data;
};

export const postJobRecommendations = async (payload) => {
  const response = await apiClient.post("/career/job-recommendations", payload);
  return response.data;
};

export const postPortfolioHtml = async (payload) => {
  const response = await apiClient.post("/career/portfolio-html", payload);
  return response.data;
};

export const postInterviewSession = async (payload) => {
  const response = await apiClient.post("/career/interview/session", payload);
  return response.data;
};

export const postInterviewFeedback = async (payload) => {
  const response = await apiClient.post("/career/interview/feedback", payload);
  return response.data;
};
