import { describe, it, expect } from "vitest";
import {
  getBuildInfo,
  getGitHubLinks,
  formatTimestamp,
  formatRelativeTime,
} from "./githubService";

describe("githubService", () => {
  describe("getBuildInfo", () => {
    it("should return build info object", () => {
      const info = getBuildInfo();
      expect(info).toHaveProperty("sha");
      expect(info).toHaveProperty("commitUrl");
      expect(info).toHaveProperty("branch");
      expect(info).toHaveProperty("timestamp");
    });
  });

  describe("getGitHubLinks", () => {
    it("should return GitHub links from default repo", () => {
      const links = getGitHubLinks();
      expect(links.repo).toContain("github.com");
      expect(links.issues).toContain("/issues");
      expect(links.newIssue).toContain("/issues/new");
    });

    it("should generate correct links from custom repo URL", () => {
      const links = getGitHubLinks("https://github.com/test/repo");
      expect(links.repo).toBe("https://github.com/test/repo");
      expect(links.issues).toBe("https://github.com/test/repo/issues");
      expect(links.newIssue).toBe("https://github.com/test/repo/issues/new");
    });

    it("should strip .git suffix from repo URL", () => {
      const links = getGitHubLinks("https://github.com/test/repo.git");
      expect(links.repo).toBe("https://github.com/test/repo");
    });
  });

  describe("formatTimestamp", () => {
    it("should return empty string for empty input", () => {
      expect(formatTimestamp("")).toBe("");
    });

    it("should format valid ISO timestamp", () => {
      const result = formatTimestamp("2025-01-15T10:30:00Z");
      expect(result).toBeTruthy();
      expect(result).not.toBe("2025-01-15T10:30:00Z");
    });

    it("should return Invalid Date for invalid timestamp", () => {
      expect(formatTimestamp("not a date")).toBe("Invalid Date");
    });
  });

  describe("formatRelativeTime", () => {
    it("should return 'Never' for null", () => {
      expect(formatRelativeTime(null)).toBe("Never");
    });

    it("should return 'Just now' for very recent times", () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe("Just now");
    });

    it("should return seconds ago for times under a minute", () => {
      const thirtySecondsAgo = new Date(Date.now() - 30000);
      expect(formatRelativeTime(thirtySecondsAgo)).toMatch(/^\d+s ago$/);
    });

    it("should return minutes ago for times under an hour", () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      expect(formatRelativeTime(fiveMinutesAgo)).toMatch(/^\d+m ago$/);
    });

    it("should return hours ago for times under a day", () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatRelativeTime(twoHoursAgo)).toMatch(/^\d+h ago$/);
    });

    it("should return date string for older times", () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const result = formatRelativeTime(twoDaysAgo);
      expect(result).not.toMatch(/ago$/);
    });
  });
});
