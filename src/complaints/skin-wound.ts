import { ComplaintCode, type ComplaintConfig } from "../types/complaint.js";
import { CTASLevel } from "../types/triage.js";

export const skinWoundConfig: ComplaintConfig = {
  code: ComplaintCode.SKIN_WOUND,
  label: "Skin, Wound, or Burn",
  description: "Cut, scrape, rash, burn, skin infection, insect bite",
  defaultCTAS: CTASLevel.LEVEL_4,
  questions: [
    {
      id: "concern_type",
      prompt: "What type of skin concern?",
      type: "single",
      options: ["Cut-laceration", "Burn", "Rash", "Other skin issue"],
      required: true,
    },
    // Cut-specific
    {
      id: "depth",
      prompt: "How deep is the cut?",
      type: "single",
      options: [
        "Superficial",
        "Deep (can see fat or muscle)",
        "Bone or tendon visible",
      ],
      required: false,
      showIf: (r) => r["concern_type"] === "Cut-laceration",
    },
    {
      id: "wound_location",
      prompt: "Where is the cut?",
      type: "single",
      options: ["Face", "Hand", "Other"],
      required: false,
      showIf: (r) => r["concern_type"] === "Cut-laceration",
    },
    {
      id: "bleeding_controlled",
      prompt: "Bleeding controlled with direct pressure?",
      type: "single",
      options: ["Yes", "No"],
      required: false,
      showIf: (r) => r["concern_type"] === "Cut-laceration",
    },
    // Burn-specific
    {
      id: "burn_cause",
      prompt: "Burn cause?",
      type: "single",
      options: ["Heat (flame/scald)", "Chemical", "Electrical", "Sunburn"],
      required: false,
      showIf: (r) => r["concern_type"] === "Burn",
    },
    {
      id: "burn_size",
      prompt: "Size relative to patient's palm?",
      type: "single",
      options: ["Less than 1 palm", "1-3 palms", "More than 3 palms"],
      required: false,
      showIf: (r) => r["concern_type"] === "Burn",
    },
    {
      id: "burn_appearance",
      prompt: "Burn appearance?",
      type: "single",
      options: [
        "Red only",
        "Blistering",
        "White or waxy",
        "Charred or black",
      ],
      required: false,
      showIf: (r) => r["concern_type"] === "Burn",
    },
    // Rash-specific
    {
      id: "rash_spreading",
      prompt: "Is the rash spreading?",
      type: "yesno",
      required: false,
      showIf: (r) => r["concern_type"] === "Rash",
    },
    {
      id: "fever_with_rash",
      prompt: "Fever present?",
      type: "yesno",
      required: false,
      showIf: (r) => r["concern_type"] === "Rash",
    },
    // Always
    {
      id: "red_streaking",
      prompt: "Red streaking extending from the area?",
      type: "yesno",
      required: true,
    },
    {
      id: "pus_drainage",
      prompt: "Pus or drainage present?",
      type: "yesno",
      required: true,
    },
  ],
};
