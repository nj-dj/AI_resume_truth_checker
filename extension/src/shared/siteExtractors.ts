import type { JobPosting, SupportedSite } from "./types";

type SiteConfig = {
  host: RegExp;
  site: SupportedSite;
  title: string[];
  company: string[];
  location: string[];
  description: string[];
};

const configs: SiteConfig[] = [
  {
    host: /linkedin\./i,
    site: "linkedin",
    title: [".job-details-jobs-unified-top-card__job-title", "h1"],
    company: [".job-details-jobs-unified-top-card__company-name", ".jobs-unified-top-card__company-name"],
    location: [".job-details-jobs-unified-top-card__primary-description-container", ".jobs-unified-top-card__bullet"],
    description: ["#job-details", ".jobs-description-content__text", ".jobs-box__html-content"],
  },
  {
    host: /indeed\./i,
    site: "indeed",
    title: ["h1[data-testid='jobsearch-JobInfoHeader-title']", "h1"],
    company: ["[data-testid='inlineHeader-companyName']", "[data-company-name='true']"],
    location: ["[data-testid='job-location']", "#jobLocationText"],
    description: ["#jobDescriptionText", "[data-testid='jobsearch-JobComponent-description']"],
  },
  {
    host: /shine\./i,
    site: "shine",
    title: ["h1", ".job_title"],
    company: [".comp_name", ".company-name"],
    location: [".loc", ".location"],
    description: [".jobDescription", ".job-description", "[itemprop='description']"],
  },
  {
    host: /monster\./i,
    site: "monster",
    title: ["h1", "[data-testid='job-title']"],
    company: ["[data-testid='company']", ".company"],
    location: ["[data-testid='job-location']", ".location"],
    description: ["[data-testid='job-description']", ".job-description"],
  },
  {
    host: /apna\.co/i,
    site: "apna",
    title: ["h1", "[class*='JobTitle']"],
    company: ["[class*='Company']", "[data-testid='company-name']"],
    location: ["[class*='Location']", "[data-testid='job-location']"],
    description: ["[class*='Description']", "[data-testid='job-description']"],
  },
  {
    host: /foundit\./i,
    site: "foundit",
    title: ["h1", ".job-title"],
    company: [".company-name", ".company"],
    location: [".location", ".job-location"],
    description: [".job-description", "#jobDescription"],
  },
  {
    host: /glassdoor\./i,
    site: "glassdoor",
    title: ["[data-test='job-title']", "h1"],
    company: ["[data-test='employer-name']", ".EmployerProfile_employerName"],
    location: ["[data-test='location']", ".JobDetails_location"],
    description: ["[data-test='jobDescriptionContent']", ".JobDetails_jobDescription"],
  },
  {
    host: /wellfound\./i,
    site: "wellfound",
    title: ["h1", "[data-test='JobTitle']"],
    company: ["[data-test='StartupName']", "[class*='company']"],
    location: ["[class*='location']", "[data-test='Location']"],
    description: ["[data-test='JobDescription']", "[class*='description']"],
  },
  {
    host: /naukri\./i,
    site: "naukri",
    title: [".styles_jd-header-title__rZwM1", "h1"],
    company: [".styles_jd-header-comp-name__MvqAI", ".company"],
    location: [".styles_jhc__location__W_pVs", ".location"],
    description: [".styles_JDC__dang-inner-html__h0K4t", ".job-desc"],
  },
  {
    host: /internshala\./i,
    site: "internshala",
    title: [".profile", "h1"],
    company: [".company_name", ".heading_6"],
    location: [".location_link", ".location"],
    description: [".internship_details", ".job_details"],
  },
];

const clean = (value: string | null | undefined) =>
  String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

const textFromSelectors = (selectors: string[]) => {
  for (const selector of selectors) {
    const value = clean(document.querySelector(selector)?.textContent);
    if (value.length > 1) return value;
  }

  return "";
};

const descriptionFromSelectors = (selectors: string[]) => {
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    const value = clean(element?.textContent);
    if (value.length > 80) return value;
  }

  const articleText = clean(document.querySelector("main")?.textContent ?? document.body.textContent);
  return articleText.length > 80 ? articleText.slice(0, 12000) : "";
};

const firstTextInside = (element: Element, selectors: string[]) => {
  for (const selector of selectors) {
    const value = clean(element.querySelector(selector)?.textContent);
    if (value.length > 1) return value;
  }

  return "";
};

const extractNaukriCard = (): JobPosting | null => {
  const cardSelectors = [
    ".srp-jobtuple-wrapper",
    ".cust-job-tuple",
    ".jobTuple",
    "article",
    "[class*='jobTuple']",
    "[class*='tuple']",
    "[class*='job-card']",
  ];

  for (const selector of cardSelectors) {
    const cards = Array.from(document.querySelectorAll(selector));

    for (const card of cards) {
      const text = clean(card.textContent);
      if (text.length < 80 || !/(yrs?|years?|remote|hybrid|onsite|save|apply)/i.test(text)) {
        continue;
      }

      const title = firstTextInside(card, [
        "a.title",
        "a[class*='title']",
        "a[href*='job-listings']",
        "a[href*='job-detail']",
        "h2 a",
        "h3 a",
        "h2",
        "h3",
      ]);

      if (!title) continue;

      const companyName = firstTextInside(card, [
        "[class*='company']",
        "[class*='comp']",
        ".subTitle",
        ".company",
        "a[href*='company']",
      ]);
      const location = firstTextInside(card, ["[class*='location']", "[class*='loc']"]);

      return {
        site: "naukri",
        url: window.location.href,
        title,
        companyName,
        location,
        description: text.slice(0, 12000),
        extractedAt: new Date().toISOString(),
      };
    }
  }

  return null;
};

export const getSupportedSite = (hostname = window.location.hostname) =>
  configs.find((config) => config.host.test(hostname)) ?? null;

export const extractJobPosting = (): JobPosting | null => {
  const config = getSupportedSite();
  if (!config) return null;

  if (config.site === "naukri" && !/job-listings|job-detail|jobdescription/i.test(window.location.href)) {
    const cardJob = extractNaukriCard();
    if (cardJob) return cardJob;
  }

  const title = textFromSelectors(config.title);
  const companyName = textFromSelectors(config.company);
  const location = textFromSelectors(config.location);
  const description = descriptionFromSelectors(config.description);

  if ((!title || description.length < 80) && config.site === "naukri") {
    return extractNaukriCard();
  }

  if (!title || description.length < 80) {
    return null;
  }

  return {
    site: config.site,
    url: window.location.href,
    title,
    companyName,
    location,
    description,
    extractedAt: new Date().toISOString(),
  };
};
