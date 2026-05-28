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
export declare class ScriptedTriageBot {
    private readonly complaint;
    private readonly questions;
    private readonly encounterId;
    private readonly responses;
    private cursor;
    private finished;
    constructor(complaint: ComplaintCode, encounterId: string);
    /**
     * Advance the conversation.
     *
     * @param userMessage - the patient's last reply. The value of the current
     * pending question is read from `userMessage.value`. For the initial call,
     * pass null/undefined.
     */
    next(userMessage?: {
        value: unknown;
    } | null): BotStep;
    private nextVisibleQuestion;
    private finalize;
    private buildIntake;
    /** Read-only access to current responses (helpful for tests). */
    getResponses(): Record<string, unknown>;
    isDone(): boolean;
    getComplaintCode(): ComplaintCode;
}
//# sourceMappingURL=scripted-bot.d.ts.map