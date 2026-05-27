import { describe, expect, it } from "vitest";
import { COMPLAINTS, getComplaint } from "../complaints/index.js";
import { ComplaintCode } from "../types/complaint.js";

describe("complaints catalog", () => {
  it("has all 14 complaint codes", () => {
    for (const code of Object.values(ComplaintCode)) {
      expect(COMPLAINTS[code]).toBeDefined();
    }
  });

  it("each complaint has at least one question", () => {
    for (const code of Object.values(ComplaintCode)) {
      const c = COMPLAINTS[code];
      expect(c.questions.length).toBeGreaterThan(0);
      expect(c.label).toBeTruthy();
      expect(c.description).toBeTruthy();
    }
  });

  it("question ids are unique within each complaint", () => {
    for (const code of Object.values(ComplaintCode)) {
      const c = COMPLAINTS[code];
      const ids = new Set<string>();
      for (const q of c.questions) {
        expect(ids.has(q.id)).toBe(false);
        ids.add(q.id);
      }
    }
  });

  it("getComplaint returns the correct config", () => {
    const cp = getComplaint(ComplaintCode.CHEST_PAIN);
    expect(cp.code).toBe(ComplaintCode.CHEST_PAIN);
  });

  it("getComplaint throws on unknown code", () => {
    expect(() => getComplaint("BOGUS" as ComplaintCode)).toThrow();
  });
});
