import { useEffect, useMemo, useRef, useState } from "react";

import ResultCard from "../../components/ResultCard.jsx";
import UploadForm from "../../components/UploadForm.jsx";
import { useSubscription } from "../../context/SubscriptionContext.jsx";
import { analyzeCandidate } from "../../services/api.js";

const LOADING_STEPS = [
  "Analyzing resume...",
  "Checking GitHub activity...",
  "Validating skills...",
  "Generating report...",
];

const DEMO_GITHUB_USERNAME = "demo-candidate";

const formatError = (error) => {
  if (error.response?.data?.message) {
    const details = error.response.data.details?.cause || error.response.data.details?.message;
    return details ? `${error.response.data.message}: ${details}` : error.response.data.message;
  }

  if (error.message) {
    return error.message;
  }

  return "Something went wrong while analyzing the candidate.";
};

const createDemoResumeFile = () => {
  const streamLines = [
    "BT",
    "/F1 12 Tf",
    "50 740 Td",
    "(Demo Candidate Resume) Tj",
    "0 -22 Td",
    "(Name: Demo Candidate) Tj",
    "0 -22 Td",
    "(Skills: JavaScript, React, Node.js, TypeScript) Tj",
    "0 -22 Td",
    "(Experience: Frontend Developer at Demo Labs, 2022-2025) Tj",
    "0 -22 Td",
    "(Project: Portfolio Dashboard built with React and JavaScript) Tj",
    "0 -22 Td",
    "(Education: B.Tech in Computer Science) Tj",
    "ET",
  ];

  const streamContent = `${streamLines.join("\n")}\n`;
  const pdfLines = [
    "%PDF-1.4",
    "1 0 obj",
    "<< /Type /Catalog /Pages 2 0 R >>",
    "endobj",
    "2 0 obj",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "endobj",
    "3 0 obj",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    "endobj",
    "4 0 obj",
    `<< /Length ${streamContent.length} >>`,
    "stream",
    streamContent.trimEnd(),
    "endstream",
    "endobj",
    "5 0 obj",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "endobj",
  ];

  let pdf = "";
  const offsets = [];

  for (const line of pdfLines) {
    if (/^[1-5] 0 obj$/.test(line)) {
      offsets.push(pdf.length);
    }

    pdf += `${line}\n`;
  }

  const xrefStart = pdf.length;
  pdf += "xref\n0 6\n";
  pdf += "0000000000 65535 f \n";

  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  }

  pdf += "trailer\n<< /Root 1 0 R /Size 6 >>\n";
  pdf += `startxref\n${xrefStart}\n%%EOF`;

  return new File([pdf], "demo-candidate-resume.pdf", {
    type: "application/pdf",
  });
};

const buildGithubInsight = ({ result, githubUsername }) => {
  const verifiedSkills = Array.isArray(result?.verified_skills) ? result.verified_skills : [];
  const uniqueLanguages = [...new Set(verifiedSkills.map((item) => item.skill).filter(Boolean))];
  const uniqueRepos = new Set();

  for (const item of verifiedSkills) {
    const evidence = item?.evidence ?? "";
    const repoMatch = evidence.match(/including\s(.+?)(?:\svia|\.)/i);
    if (!repoMatch?.[1]) {
      continue;
    }

    repoMatch[1]
      .split(",")
      .map((repo) => repo.trim())
      .filter(Boolean)
      .forEach((repo) => uniqueRepos.add(repo));
  }

  return {
    username: githubUsername,
    repositories: uniqueRepos.size,
    languagesLabel: uniqueLanguages.length ? uniqueLanguages.join(", ") : "None",
    lastActive: uniqueRepos.size ? "Derived from verified repository evidence" : "N/A",
  };
};

const createDemoResult = () => ({
  score: 78,
  decision: "Maybe",
  verified_skills: [
    {
      skill: "JavaScript",
      evidence: "Used in 4 repositories including portfolio-dashboard, crm-console, hiring-pipeline.",
    },
    {
      skill: "React",
      evidence: "Frontend evidence found across portfolio-dashboard and crm-console via JavaScript projects.",
    },
    {
      skill: "TypeScript",
      evidence: "Used in 2 repositories including hiring-pipeline and design-system.",
    },
  ],
  suspicious_claims: [
    {
      skill: "Python",
      reason: "Claimed on the resume, but no supporting GitHub repository evidence was found in the demo profile.",
    },
  ],
  strengths: [
    "Consistent frontend stack across multiple repositories.",
    "Healthy project spread with JavaScript and React evidence.",
  ],
  weaknesses: ["Some claimed backend depth is not reflected in GitHub activity."],
  summary:
    "Strong frontend-oriented candidate with credible JavaScript and React evidence, but a few broader claims remain only partially supported.",
});

const wait = (ms) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

export default function TruthCheckerPage() {
  const { consumeCredits } = useSubscription();
  const [resumeFile, setResumeFile] = useState(null);
  const [githubUsername, setGithubUsername] = useState("");
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [lastSubmittedGithubUsername, setLastSubmittedGithubUsername] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const resultRef = useRef(null);

  const selectedFileName = useMemo(() => resumeFile?.name || "", [resumeFile]);
  const githubInsight = useMemo(
    () =>
      result
        ? buildGithubInsight({
            result,
            githubUsername: lastSubmittedGithubUsername,
          })
        : null,
    [result, lastSubmittedGithubUsername],
  );

  useEffect(() => {
    if (!isLoading) {
      setLoadingStepIndex(0);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setLoadingStepIndex((currentIndex) => (currentIndex + 1) % LOADING_STEPS.length);
    }, 1400);

    return () => window.clearInterval(intervalId);
  }, [isLoading]);

  const handleFileChange = (event) => {
    setResumeFile(event.target.files?.[0] ?? null);
    setIsDemoMode(false);
  };

  const handleTryDemoCandidate = () => {
    setResumeFile(createDemoResumeFile());
    setGithubUsername(DEMO_GITHUB_USERNAME);
    setErrorMessage("");
    setIsDemoMode(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!resumeFile) {
      setErrorMessage("Please upload a PDF resume before starting the analysis.");
      return;
    }

    if (!githubUsername.trim()) {
      setErrorMessage("Please enter a GitHub username.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setLastSubmittedGithubUsername(githubUsername.trim());

    try {
      if (isDemoMode && githubUsername.trim() === DEMO_GITHUB_USERNAME) {
        await wait(4200);
        setResult(createDemoResult());
        requestAnimationFrame(() => {
          resultRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
        return;
      }

      const usage = consumeCredits({ feature: "truthChecker", cost: 8 });
      if (!usage.ok) {
        setErrorMessage(usage.message);
        return;
      }

      const response = await analyzeCandidate({
        resumeFile,
        githubUsername: githubUsername.trim(),
      });

      setResult(response.data);

      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch (error) {
      setResult(null);
      setErrorMessage(formatError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-container-max mx-auto space-y-10">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">Resume verification</p>
        <div className="space-y-2 rounded-[1.5rem] panel-card-soft p-8">
          <h1 className="text-headline-lg font-semibold tracking-tight text-primary">AI Resume Truth Checker</h1>
          <p className="max-w-3xl text-body-lg text-on-surface-variant">
            Check resume claims against AI analysis and GitHub activity, then get a clear credibility report.
          </p>
        </div>
      </header>

      <UploadForm
        githubUsername={githubUsername}
        onGithubUsernameChange={setGithubUsername}
        onFileChange={handleFileChange}
        onSubmit={handleSubmit}
        onTryDemoCandidate={handleTryDemoCandidate}
        isLoading={isLoading}
        isDemoMode={isDemoMode}
        loadingStep={LOADING_STEPS[loadingStepIndex]}
        selectedFileName={selectedFileName}
      />

      {errorMessage ? (
        <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-5 py-4 text-sm text-amber-900">
          {errorMessage}
        </div>
      ) : null}

      {result ? (
        <div ref={resultRef} className="space-y-6">
          <ResultCard result={result} githubInsight={githubInsight} />
        </div>
      ) : null}
    </div>
  );
}
