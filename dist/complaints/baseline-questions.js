export const ONSET_OPTIONS = [
    "< 1 hour",
    "1-6 hours",
    "6-24 hours",
    "1-3 days",
    "3-7 days",
    "> 1 week",
];
export const TRAJECTORY_OPTIONS = ["Better", "Same", "Worse"];
export const COMORBIDITY_OPTIONS = [
    "Diabetes",
    "Heart Disease",
    "High Blood Pressure",
    "Asthma-COPD",
    "Cancer",
    "Kidney Disease",
    "Immune Disorder",
    "Blood Thinners",
    "Pregnancy",
    "None",
];
export const BASELINE_QUESTIONS = [
    {
        id: "onset",
        prompt: "When did this start?",
        type: "single",
        options: ONSET_OPTIONS,
        required: true,
    },
    {
        id: "pain_level",
        prompt: "On a scale of 1-10, how would you rate your discomfort?",
        type: "slider",
        min: 1,
        max: 10,
        required: true,
    },
    {
        id: "trajectory",
        prompt: "Is this getting better, staying the same, or getting worse?",
        type: "single",
        options: TRAJECTORY_OPTIONS,
        required: true,
    },
    {
        id: "comorbidities",
        prompt: "Do you have any of the following conditions?",
        type: "multi",
        options: COMORBIDITY_OPTIONS,
        required: true,
    },
    {
        id: "current_medications",
        prompt: "Are you currently taking any medications? If yes, please list them.",
        type: "text",
        required: false,
    },
    {
        id: "recent_visit",
        prompt: "Have you visited an ER or doctor for this same concern in the past 7 days?",
        type: "yesno",
        required: true,
    },
    {
        id: "drug_allergies",
        prompt: "Do you have any drug allergies? If yes, please list them.",
        type: "text",
        required: false,
    },
];
//# sourceMappingURL=baseline-questions.js.map