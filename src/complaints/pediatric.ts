import { ComplaintCode, type ComplaintConfig } from "../types/complaint.js";
import { CTASLevel } from "../types/triage.js";

export const pediatricConfig: ComplaintConfig = {
  code: ComplaintCode.PEDIATRIC,
  label: "Child is Unwell (Under 16)",
  description: "My child is sick, injured, or I'm concerned about them",
  defaultCTAS: CTASLevel.LEVEL_3,
  questions: [
    {
      id: "child_age_years",
      prompt: "Child's age in years?",
      type: "number",
      min: 0,
      max: 15,
      required: true,
    },
    {
      id: "child_age_months",
      prompt: "If under 2 years, age in months?",
      type: "number",
      min: 0,
      max: 24,
      required: false,
      showIf: (responses) => {
        const yrs = responses["child_age_years"];
        return typeof yrs === "number" && yrs < 2;
      },
    },
    {
      id: "consciousness",
      prompt: "Alert and responsive?",
      type: "single",
      options: [
        "Normal",
        "Drowsy but rousable",
        "Difficult to wake",
        "Unresponsive",
      ],
      required: true,
    },
    {
      id: "feeding",
      prompt: "Feeding/drinking normally?",
      type: "single",
      options: ["Yes", "Reduced", "Refusing all fluids"],
      required: true,
    },
    {
      id: "wet_diapers",
      prompt: "Wet diapers in past 12 hours? (if under 3 years)",
      type: "single",
      options: ["Normal (4+)", "Reduced (2-3)", "Very few (0-1)", "N/A"],
      required: false,
    },
    {
      id: "rash_type",
      prompt: "Rash?",
      type: "single",
      options: [
        "No",
        "Yes, blanching (fades when pressed)",
        "Yes, non-blanching (doesn't fade)",
      ],
      required: true,
    },
    {
      id: "fontanelle",
      prompt: "Fontanelle bulging? (if under 18 months)",
      type: "single",
      options: ["Yes", "No", "N/A"],
      required: false,
    },
    {
      id: "seizures",
      prompt: "Seizures?",
      type: "yesno",
      required: true,
    },
    {
      id: "vaccinations",
      prompt: "Vaccinations up to date?",
      type: "single",
      options: ["Yes", "No", "Don't know"],
      required: true,
    },
    {
      id: "fever",
      prompt: "Does the child have a fever?",
      type: "yesno",
      required: true,
    },
    {
      id: "temperature",
      prompt: "Temperature (in degrees Celsius, if measured)?",
      type: "number",
      min: 30,
      max: 45,
      required: false,
    },
    {
      id: "vomiting_diarrhea",
      prompt: "Vomiting and/or diarrhea with reduced intake?",
      type: "yesno",
      required: true,
    },
    {
      id: "inconsolable_crying",
      prompt: "Inconsolable crying for more than 2 hours?",
      type: "yesno",
      required: true,
    },
    {
      id: "parent_gut_instinct",
      prompt: "Do you feel something is very wrong?",
      type: "yesno",
      required: true,
    },
  ],
};
