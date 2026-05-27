import { ComplaintCode, type ComplaintConfig } from "../types/complaint.js";
import { CTASLevel } from "../types/triage.js";

export const abdominalConfig: ComplaintConfig = {
  code: ComplaintCode.ABDOMINAL,
  label: "Stomach or Abdominal Pain",
  description: "Pain, cramping, or discomfort in your belly area",
  defaultCTAS: CTASLevel.LEVEL_4,
  questions: [
    {
      id: "location",
      prompt: "Where is the pain?",
      type: "single",
      options: [
        "Upper right",
        "Upper left",
        "Upper center",
        "Lower right",
        "Lower left",
        "Lower center",
        "All over",
      ],
      required: true,
    },
    {
      id: "pain_character",
      prompt: "What does the pain feel like?",
      type: "single",
      options: ["Sharp", "Crampy", "Dull-aching", "Burning", "Colicky"],
      required: true,
    },
    {
      id: "vomiting",
      prompt: "Have you had any vomiting?",
      type: "single",
      options: [
        "No",
        "Yes once-twice",
        "Yes multiple times",
        "Yes, with blood",
      ],
      required: true,
    },
    {
      id: "blood_stool",
      prompt: "Blood in stool or dark/tarry stools?",
      type: "yesno",
      required: true,
    },
    {
      id: "diarrhea",
      prompt: "Do you have diarrhea?",
      type: "single",
      options: ["No", "Non-bloody", "Bloody"],
      required: true,
    },
    {
      id: "eating_status",
      prompt: "Have you been able to eat or drink?",
      type: "single",
      options: ["Yes normally", "Reduced", "Unable to keep anything down"],
      required: true,
    },
    {
      id: "abdomen_rigid",
      prompt: "Is your abdomen swollen or rigid?",
      type: "yesno",
      required: true,
    },
    {
      id: "pregnancy_possible",
      prompt: "Any chance of pregnancy?",
      type: "single",
      options: ["Yes", "No", "N/A"],
      required: true,
    },
    {
      id: "fever",
      prompt: "Do you have a fever?",
      type: "single",
      options: ["Yes", "No", "Not sure"],
      required: true,
    },
    {
      id: "recent_surgery",
      prompt: "Recent abdominal surgery?",
      type: "yesno",
      required: true,
    },
  ],
};
