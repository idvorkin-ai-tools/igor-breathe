import { describe, it, expect } from "vitest";
import { formatTime } from "./utils";

describe("formatTime", () => {
  it("should format 0 seconds as 0:00", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("should format seconds less than a minute", () => {
    expect(formatTime(5)).toBe("0:05");
    expect(formatTime(30)).toBe("0:30");
    expect(formatTime(59)).toBe("0:59");
  });

  it("should format exactly one minute", () => {
    expect(formatTime(60)).toBe("1:00");
  });

  it("should format minutes and seconds", () => {
    expect(formatTime(65)).toBe("1:05");
    expect(formatTime(90)).toBe("1:30");
    expect(formatTime(125)).toBe("2:05");
  });

  it("should format longer durations", () => {
    expect(formatTime(600)).toBe("10:00");
    expect(formatTime(3661)).toBe("61:01");
  });

  it("should pad single digit seconds with zero", () => {
    expect(formatTime(1)).toBe("0:01");
    expect(formatTime(61)).toBe("1:01");
    expect(formatTime(609)).toBe("10:09");
  });
});
