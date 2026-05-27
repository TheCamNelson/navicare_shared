import { randomUUID } from "node:crypto";
import {
  BASELINE_QUESTIONS,
  getComplaint,
} from "../complaints/index.js";
import type { ComplaintCode } from "../types/complaint.js";
import type { IntakeData } from "../types/intake.js";
import type { Question } from "../types/question.js";

export interface BotStep {
  text: string;
  ask?: Question;
  done?: boolean;
  intake?: IntakeData;
}

/**
 * Deterministic scripted triage bot.
 *
 * Greets the user, walks through baseline + complaint-specific questions one
 * at a time, and emits the assembled IntakeData when finished. No LLM, no I/O.
 */
export class ScriptedTriageBot {
  private readonly complaint: ComplaintCode;
  private readonly questions: Question[];
  private readonly encounterId: string;
  private readonly responses: Record<string, unknown> = {};
  private cursor = -1; // -1 = not yet greeted
  private finished = false;

  constructor(complaint: ComplaintCode, encounterId: string) {
    this.complaint = complaint;
    this.encounterId = encounterId;
    const config = getComplaint(complaint);
    this.questions = [...BASELINE_QUESTIONS, ...config.questions];
  }

  /**
   * Advance the conversation.
   *
   * @param userMessage - the patient's last reply. The value of the current
   * pending question is read from `userMessage.value`. For the initial call,
   * pass null/undefined.
   */
  next(userMessage?: { value: unknown } | null): BotStep {
    if (this.finished) {
      return { text: "Triage complete.", done: true };
    }

    // Initial greeting
    if (this.cursor === -1) {
      this.cursor = 0;
      const first = this.nextVisibleQuestion(0);
      if (!first) return this.finalize();
      return {
        text:
          "Hello, I'm NaviCare's virtual triage assistant. " +
          "I'll ask you a few questions to help us understand what's going on. " +
          "Please answer as accurately as you can.",
        ask: first.question,
      };
    }

    // Record the response to the current question
    const current = this.questions[this.cursor];
    if (current && userMessage && typeof userMessage === "object") {
      this.responses[current.id] = userMessage.value;
    }

    // Advance cursor
    const next = this.nextVisibleQuestion(this.cursor + 1);
    if (!next) {
      return this.finalize();
    }
    this.cursor = next.index;
    return {
      text: "Thanks. Next question:",
      ask: next.question,
    };
  }

  private nextVisibleQuestion(
    startIndex: number,
  ): { index: number; question: Question } | null {
    for (let i = startIndex; i < this.questions.length; i++) {
      const q = this.questions[i]!;
      if (!q.showIf || q.showIf(this.responses)) {
        return { index: i, question: q };
      }
    }
    return null;
  }

  private finalize(): BotStep {
    this.finished = true;
    const intake = this.buildIntake();
    return {
      text: "Thank you. I'm submitting your responses for triage now.",
      done: true,
      intake,
    };
  }

  private buildIntake(): IntakeData {
    const r = this.responses;
    const complaint_responses: Record<string, unknown> = {};
    const baselineIds = new Set(BASELINE_QUESTIONS.map((q) => q.id));
    for (const [k, v] of Object.entries(r)) {
      if (!baselineIds.has(k)) complaint_responses[k] = v;
    }
    return {
      id: randomUUID(),
      encounter_id: this.encounterId,
      onset: (r["onset"] as string) ?? "",
      pain_level: (r["pain_level"] as number) ?? 0,
      trajectory: (r["trajectory"] as string) ?? "",
      comorbidities: (r["comorbidities"] as string[]) ?? [],
      current_medications: (r["current_medications"] as string) ?? "",
      recent_visit:
        r["recent_visit"] === true || r["recent_visit"] === "Yes",
      drug_allergies: (r["drug_allergies"] as string) ?? "",
      complaint_responses,
      created_at: new Date(),
    };
  }

  /** Read-only access to current responses (helpful for tests). */
  getResponses(): Record<string, unknown> {
    return { ...this.responses };
  }

  isDone(): boolean {
    return this.finished;
  }

  getComplaintCode(): ComplaintCode {
    return this.complaint;
  }
}
