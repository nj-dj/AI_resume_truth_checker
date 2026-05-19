import type { AuthSession, JobPosting, UsageState } from "./types";

type StorageShape = {
  session?: AuthSession;
  activeJob?: JobPosting;
  usage?: UsageState;
  lastCoverLetter?: string;
};

export const storage = {
  async get<K extends keyof StorageShape>(key: K): Promise<StorageShape[K] | undefined> {
    const result = await chrome.storage.local.get(key);
    return result[key] as StorageShape[K] | undefined;
  },

  async set(values: StorageShape) {
    await chrome.storage.local.set(values);
  },

  async remove(keys: (keyof StorageShape)[]) {
    await chrome.storage.local.remove(keys);
  },
};
