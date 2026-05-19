import { extractJobPosting } from "../shared/siteExtractors";
import type { CoverLetterResult, ExtensionMessage, JobPosting } from "../shared/types";
import "./styles.css";

const ROOT_ID = "resumeos-cover-letter-root";

const sendMessage = <T,>(message: ExtensionMessage) =>
  chrome.runtime.sendMessage(message) as Promise<{ success: boolean; data?: T; message?: string }>;

const escapeHtml = (value: string | undefined) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const createRoot = () => {
  const existing = document.getElementById(ROOT_ID);
  if (existing) return existing;

  const root = document.createElement("div");
  root.id = ROOT_ID;
  document.documentElement.append(root);
  return root;
};

const renderPanel = ({ job, loading = false, result, error }: { job: JobPosting; loading?: boolean; result?: CoverLetterResult; error?: string }) => {
  const root = createRoot();
  root.innerHTML = `
    <div class="resumeos-widget">
      <button class="resumeos-close" aria-label="Close">x</button>
      <div class="resumeos-kicker">${escapeHtml(job.site)} job detected</div>
      <h3>${escapeHtml(job.title)}</h3>
      <p>${escapeHtml(job.companyName || "Company not detected")}${job.location ? ` - ${escapeHtml(job.location)}` : ""}</p>
      ${
        result
          ? `<textarea readonly>${escapeHtml(result.bodyMarkdown)}</textarea>
             <div class="resumeos-row">
               <button class="resumeos-copy">Copy</button>
               <button class="resumeos-save">Save Cover Letter</button>
             </div>`
          : `<button class="resumeos-generate" ${loading ? "disabled" : ""}>${loading ? "Generating..." : "Generate Cover Letter"}</button>`
      }
      ${error ? `<div class="resumeos-error">${escapeHtml(error)}</div>` : ""}
    </div>
  `;

  root.querySelector(".resumeos-close")?.addEventListener("click", () => root.remove());
  root.querySelector(".resumeos-generate")?.addEventListener("click", () => void generate(job));
  root.querySelector(".resumeos-copy")?.addEventListener("click", async () => {
    if (result?.bodyMarkdown) await navigator.clipboard.writeText(result.bodyMarkdown);
  });
  root.querySelector(".resumeos-save")?.addEventListener("click", async () => {
    if (!result?.bodyMarkdown) return;
    await sendMessage({ type: "SAVE_COVER_LETTER", payload: { coverLetterId: result.id, job, content: result.bodyMarkdown } });
  });
};

const renderFab = (job: JobPosting) => {
  const root = createRoot();
  root.innerHTML = `
    <button class="resumeos-fab" title="Generate a cover letter">
      <span class="resumeos-fab-icon" aria-hidden="true">R</span>
      <span class="resumeos-fab-label">Cover Letter</span>
    </button>
  `;
  root.querySelector(".resumeos-fab")?.addEventListener("click", () => renderPanel({ job }));
};

const generate = async (job: JobPosting) => {
  renderPanel({ job, loading: true });
  const response = await sendMessage<CoverLetterResult>({ type: "GENERATE_COVER_LETTER", payload: job });

  if (!response.success || !response.data) {
    renderPanel({ job, error: response.message ?? "Unable to generate cover letter. Sign in from the extension popup and try again." });
    return;
  }

  renderPanel({ job, result: response.data });
};

const detect = () => {
  const job = extractJobPosting();
  if (!job) return;

  void sendMessage({ type: "JOB_DETECTED", payload: job });
  renderFab(job);
};

const observer = new MutationObserver(() => {
  window.clearTimeout(Number((window as unknown as { resumeosTimer?: number }).resumeosTimer));
  (window as unknown as { resumeosTimer?: number }).resumeosTimer = window.setTimeout(detect, 600);
});

detect();
observer.observe(document.body, { childList: true, subtree: true });
