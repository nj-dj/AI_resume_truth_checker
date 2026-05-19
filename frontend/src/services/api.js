import axios from "axios";

export const AUTH_SESSION_STORAGE_KEY = "resume-os-auth-session";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 120000,
});

const shouldRetryApiRoute = (error) => {
  const status = error.response?.status;
  return status === 404 || status >= 500;
};

const postWithApiRouteFallback = async (path, payload) => {
  try {
    return await apiClient.post(path, payload);
  } catch (error) {
    if (apiClient.defaults.baseURL === "/api" && shouldRetryApiRoute(error)) {
      return apiClient.post(`/api${path}`, payload);
    }

    throw error;
  }
};

apiClient.interceptors.request.use((config) => {
  const rawSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (rawSession) {
    try {
      const session = JSON.parse(rawSession);
      if (session?.accessToken) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    } catch {
      window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
    }
  }

  return config;
});

export const signupUser = async (payload) => {
  const response = await postWithApiRouteFallback("/auth/signup", payload);
  return response.data;
};

export const loginUser = async (payload) => {
  const response = await postWithApiRouteFallback("/auth/login", payload);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await apiClient.get("/auth/me");
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};

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
