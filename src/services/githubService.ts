/**
 * GitHub Integration Service
 */

import {
  BUILD_TIMESTAMP,
  GIT_BRANCH,
  GIT_COMMIT_URL,
  GIT_CURRENT_URL,
  GIT_SHA,
} from "../generated_version";

const DEFAULT_REPO_URL = "https://github.com/idvorkin-ai-tools/igor-breathe";

export interface BuildInfo {
  sha: string;
  commitUrl: string;
  currentUrl: string;
  branch: string;
  timestamp: string;
}

export interface GitHubLinks {
  repo: string;
  issues: string;
  newIssue: string;
}

export function getBuildInfo(): BuildInfo {
  return {
    sha: GIT_SHA,
    commitUrl: GIT_COMMIT_URL,
    currentUrl: GIT_CURRENT_URL,
    branch: GIT_BRANCH,
    timestamp: BUILD_TIMESTAMP,
  };
}

export function getRepoUrl(): string {
  if (
    typeof import.meta !== "undefined" &&
    import.meta.env?.VITE_GITHUB_REPO_URL
  ) {
    return import.meta.env.VITE_GITHUB_REPO_URL;
  }
  return DEFAULT_REPO_URL;
}

export function getGitHubLinks(repoUrl: string = getRepoUrl()): GitHubLinks {
  const base = repoUrl.replace(/\.git$/, "");
  return {
    repo: base,
    issues: `${base}/issues`,
    newIssue: `${base}/issues/new`,
  };
}

export function formatTimestamp(timestamp: string): string {
  if (!timestamp) return "";
  try {
    return new Date(timestamp).toLocaleString();
  } catch {
    return timestamp;
  }
}

export function formatRelativeTime(date: Date | null): string {
  if (!date) return "Never";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 10) return "Just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return date.toLocaleDateString();
}
