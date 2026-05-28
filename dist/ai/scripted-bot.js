import { randomUUID } from "node:crypto";
import { BASELINE_QUESTIONS, getComplaint, } from "../complaints/index.js";
/**
 * Deterministic scripted triage bot.
 *
 * Greets the user, walks through baseline + complaint-specific questions one
 * at a time, and emits the assembled IntakeData when finished. No LLM, no I/O.
 */
export class ScriptedTriageBot {
    complaint;
    questions;
    encounterId;
    responses = {};
    cursor = -1; // -1 = not yet greeted
    finished = false;
    constructor(complaint, encounterId) {
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
    next(userMessage) {
        if (this.finished) {
            return { text: "Triage complete.", done: true };
        }
        // Initial greeting
        if (this.cursor === -1) {
            this.cursor = 0;
            const first = this.nextVisibleQuestion(0);
            if (!first)
                return this.finalize();
            return {
                text: "Hello, I'm NaviCare's virtual triage assistant. " +
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
    nextVisibleQuestion(startIndex) {
        for (let i = startIndex; i < this.questions.length; i++) {
            const q = this.questions[i];
            if (!q.showIf || q.showIf(this.responses)) {
                return { index: i, question: q };
            }
        }
        return null;
    }
    finalize() {
        this.finished = true;
        const intake = this.buildIntake();
        return {
            text: "Thank you. I'm submitting your responses for triage now.",
            done: true,
            intake,
        };
    }
    buildIntake() {
        const r = this.responses;
        const complaint_responses = {};
        const baselineIds = new Set(BASELINE_QUESTIONS.map((q) => q.id));
        for (const [k, v] of Object.entries(r)) {
            if (!baselineIds.has(k))
                complaint_responses[k] = v;
        }
        return {
            id: randomUUID(),
            encounter_id: this.encounterId,
            onset: r["onset"] ?? "",
            pain_level: r["pain_level"] ?? 0,
            trajectory: r["trajectory"] ?? "",
            comorbidities: r["comorbidities"] ?? [],
            current_medications: r["current_medications"] ?? "",
            recent_visit: r["recent_visit"] === true || r["recent_visit"] === "Yes",
            drug_allergies: r["drug_allergies"] ?? "",
            complaint_responses,
            created_at: new Date(),
        };
    }
    /** Read-only access to current responses (helpful for tests). */
    getResponses() {
        return { ...this.responses };
    }
    isDone() {
        return this.finished;
    }
    getComplaintCode() {
        return this.complaint;
    }
}
//# sourceMappingURL=scripted-bot.js.map