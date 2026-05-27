import { ComplaintCode, type ComplaintConfig } from "../types/complaint.js";
import { CTASLevel } from "../types/triage.js";

export const headacheConfig: ComplaintConfig = {
  code: ComplaintCode.HEADACHE,
  label: "Headache",
  description: "Head pain, pressure, or migraine",
  defaultCTAS: CTASLevel.LEVEL_4,
  questions: [
    {
      id: "severity",
      prompt: "How would you describe this headache?",
      type: "single",
      options: ["Worst of my life", "Severe", "Moderate", "Mild"],
      required: true,
    },
    {
      id: "onset_type",
      prompt: "Did it come on suddenly or gradually?",
      type: "single",
      options: ["Sudden (seconds-minutes)", "Gradual (hours)"],
      required: true,
    },
    {
      id: "stiff_neck",
      prompt: "Stiff neck?",
      type: "yesno",
      required: true,
    },
    {
      id: "fever",
      prompt: "Fever?",
      type: "yesno",
      required: true,
    },
    {
      id: "vision_changes",
      prompt: "Vision changes?",
      type: "multi",
      options: ["Blurry", "Double", "Vision loss", "Spots-aura", "None"],
      required: true,
    },
    {
      id: "weakness_one_side",
      prompt: "Weakness or numbness on one side?",
      type: "yesno",
      required: true,
    },
    {
      id: "speech_difficulty",
      prompt: "Difficulty speaking or understanding speech?",
      type: "yesno",
      required: true,
    },
    {
      id: "head_injury",
      prompt: "Recent head injury?",
      type: "yesno",
      required: true,
    },
    {
      id: "migraine_history",
      prompt: "History of migraines?",
      type: "yesno",
      required: true,
    },
    {
      id: "different_from_usual",
      prompt: "Different from usual headaches?",
      type: "single",
      options: ["Yes", "No", "Don't usually get headaches"],
      required: true,
    },
    {
      id: "seizure",
      prompt: "Recent seizure?",
      type: "yesno",
      required: true,
    },
  ],
};
