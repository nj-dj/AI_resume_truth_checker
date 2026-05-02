import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 60000,
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
