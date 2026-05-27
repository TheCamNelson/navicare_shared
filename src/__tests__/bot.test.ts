import { describe, expect, it } from "vitest";
import { ScriptedTriageBot } from "../ai/scripted-bot.js";
import { ComplaintCode } from "../types/complaint.js";

describe("ScriptedTriageBot", () => {
  it("greets, walks through baseline + complaint questions, produces IntakeData", () => {
    const bot = new ScriptedTriageBot(ComplaintCode.HEADACHE, "encounter-1");

    // Greeting + first question
    const first = bot.next();
    expect(first.text).toMatch(/NaviCare/);
    expect(first.ask).toBeDefined();
    expect(first.done).not.toBe(true);

    const answers: Record<string, unknown> = {
      onset: "1-6 hours",
      pain_level: 8,
      trajectory: "Worse",
      comorbidities: ["None"],
      current_medications: "None",
      recent_visit: false,
      drug_allergies: "None",
      severity: "Worst of my life",
      onset_type: "Sudden (seconds-minutes)",
      stiff_neck: "No",
      fever: "No",
      vision_changes: ["None"],
      weakness_one_side: "No",
      speech_difficulty: "No",
      head_injury: "No",
      migraine_history: "No",
      different_from_usual: "Yes",
      seizure: "No",
    };

    let step = first;
    let safety = 0;
    while (step.ask && !step.done) {
      if (safety++ > 50) throw new Error("Bot didn't terminate");
      const id = step.ask.id;
      step = bot.next({ value: answers[id] });
    }

    expect(step.done).toBe(true);
    expect(step.intake).toBeDefined();
    expect(step.intake!.onset).toBe("1-6 hours");
    expect(step.intake!.pain_level).toBe(8);
    expect(step.intake!.complaint_responses["severity"]).toBe(
      "Worst of my life",
    );
  });

  it("does not loop forever for branching complaints", () => {
    const bot = new ScriptedTriageBot(ComplaintCode.SKIN_WOUND, "encounter-2");
    const answers: Record<string, unknown> = {
      onset: "6-24 hours",
      pain_level: 3,
      trajectory: "Better",
      comorbidities: ["None"],
      current_medications: "None",
      recent_visit: false,
      drug_allergies: "None",
      concern_type: "Cut-laceration",
      depth: "Superficial",
      wound_location: "Other",
      bleeding_controlled: "Yes",
      red_streaking: "No",
      pus_drainage: "No",
    };
    let step = bot.next();
    let safety = 0;
    while (step.ask && !step.done) {
      if (safety++ > 50) throw new Error("Bot didn't terminate");
      step = bot.next({ value: answers[step.ask.id] });
    }
    expect(step.done).toBe(true);
    expect(step.intake?.complaint_responses["concern_type"]).toBe("Cut-laceration");
    // Burn-specific questions should not be in the intake
    expect(step.intake?.complaint_responses["burn_cause"]).toBeUndefined();
  });

  it("isDone and getComplaintCode helpers work", () => {
    const bot = new ScriptedTriageBot(ComplaintCode.FEVER, "encounter-3");
    expect(bot.isDone()).toBe(false);
    expect(bot.getComplaintCode()).toBe(ComplaintCode.FEVER);
  });
});
