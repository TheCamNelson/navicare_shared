import { ComplaintCode, type ComplaintConfig } from "../types/complaint.js";
import { CTASLevel } from "../types/triage.js";

export const feverConfig: ComplaintConfig = {
  code: ComplaintCode.FEVER,
  label: "Fever or Infection Symptoms",
  description: "High temperature, chills, body aches, feeling unwell",
  defaultCTAS: CTASLevel.LEVEL_4,
  questions: [
    {
      id: "temperature",
      prompt: "Temperature (in degrees Celsius, if measured)?",
      type: "number",
      min: 30,
      max: 45,
      required: false,
    },
    {
      id: "duration",
      prompt: "Duration of fever?",
      type: "single",
      options: ["< 24 hours", "1-3 days", "3-7 days", "> 1 week"],
      required: true,
    },
    {
      id: "rigors",
      prompt: "Chills or rigors (shaking)?",
      type: "yesno",
      required: true,
    },
    {
      id: "rash",
      prompt: "Rash?",
      type: "single",
      options: ["No", "Flat", "Raised-bumpy", "Blistering", "Spreading rapidly"],
      required: true,
    },
    {
      id: "cough",
      prompt: "Cough?",
      type: "single",
      options: ["No", "Dry", "Productive", "With blood"],
      required: true,
    },
    {
      id: "pain_urination",
      prompt: "Pain with urination?",
      type: "yesno",
      required: true,
    },
    {
      id: "neck_stiffness",
      prompt: "Neck stiffness?",
      type: "yesno",
      required: true,
    },
    {
      id: "confusion",
      prompt: "Confusion or difficulty staying awake?",
      type: "yesno",
      required: true,
    },
    {
      id: "travel",
      prompt: "Recent international travel?",
      type: "yesno",
      required: true,
    },
    {
      id: "immunocompromised",
      prompt: "Immunocompromised?",
      type: "yesno",
      required: true,
    },
    {
      id: "recent_hospital",
      prompt: "Recent surgery or hospital stay?",
      type: "yesno",
      required: true,
    },
  ],
};
