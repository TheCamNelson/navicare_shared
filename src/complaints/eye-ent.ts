import { ComplaintCode, type ComplaintConfig } from "../types/complaint.js";
import { CTASLevel } from "../types/triage.js";

export const eyeEntConfig: ComplaintConfig = {
  code: ComplaintCode.EYE_ENT,
  label: "Eye, Ear, Nose, or Throat",
  description: "Eye pain, ear infection, sore throat, nosebleed, vision change",
  defaultCTAS: CTASLevel.LEVEL_4,
  questions: [
    {
      id: "area",
      prompt: "Which area is affected?",
      type: "single",
      options: ["Eye(s)", "Ear(s)", "Throat", "Nose"],
      required: true,
    },
    // Eye
    {
      id: "vision_loss",
      prompt: "Sudden vision loss?",
      type: "yesno",
      required: false,
      showIf: (r) => r["area"] === "Eye(s)",
    },
    {
      id: "chemical_exposure",
      prompt: "Chemical exposure to the eye?",
      type: "yesno",
      required: false,
      showIf: (r) => r["area"] === "Eye(s)",
    },
    {
      id: "eye_injury",
      prompt: "Recent eye injury?",
      type: "yesno",
      required: false,
      showIf: (r) => r["area"] === "Eye(s)",
    },
    {
      id: "eye_symptoms",
      prompt: "Other eye symptoms?",
      type: "multi",
      options: ["Redness", "Discharge", "Itching", "Pain", "Light sensitivity", "None"],
      required: false,
      showIf: (r) => r["area"] === "Eye(s)",
    },
    // Ear
    {
      id: "hearing_loss",
      prompt: "Hearing loss?",
      type: "yesno",
      required: false,
      showIf: (r) => r["area"] === "Ear(s)",
    },
    {
      id: "ear_drainage",
      prompt: "Drainage from the ear?",
      type: "yesno",
      required: false,
      showIf: (r) => r["area"] === "Ear(s)",
    },
    // Throat
    {
      id: "can_swallow",
      prompt: "Can you swallow?",
      type: "single",
      options: ["Yes normally", "With difficulty", "Cannot swallow at all"],
      required: false,
      showIf: (r) => r["area"] === "Throat",
    },
    {
      id: "voice_muffled",
      prompt: "Muffled voice?",
      type: "yesno",
      required: false,
      showIf: (r) => r["area"] === "Throat",
    },
    {
      id: "drooling",
      prompt: "Drooling?",
      type: "yesno",
      required: false,
      showIf: (r) => r["area"] === "Throat",
    },
    {
      id: "throat_fever",
      prompt: "Fever?",
      type: "yesno",
      required: false,
      showIf: (r) => r["area"] === "Throat",
    },
    // Nose
    {
      id: "active_nosebleed",
      prompt: "Active nosebleed, and for how long?",
      type: "single",
      options: ["No", "Yes, < 20 minutes", "Yes, > 20 minutes uncontrolled"],
      required: false,
      showIf: (r) => r["area"] === "Nose",
    },
    // Always
    {
      id: "breathing_difficulty",
      prompt: "Any breathing difficulty?",
      type: "yesno",
      required: true,
    },
  ],
};
