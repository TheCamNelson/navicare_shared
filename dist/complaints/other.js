import { ComplaintCode } from "../types/complaint.js";
import { CTASLevel } from "../types/triage.js";
export const otherConfig = {
    code: ComplaintCode.OTHER,
    label: "Something Else",
    description: "My concern doesn't fit the categories above",
    defaultCTAS: CTASLevel.LEVEL_3,
    questions: [
        {
            id: "description",
            prompt: "Please describe your concern.",
            type: "text",
            required: true,
        },
        {
            id: "affected_area",
            prompt: "Affected body area?",
            type: "text",
            required: true,
        },
        {
            id: "severity",
            prompt: "How severe is your concern (1-10)?",
            type: "slider",
            min: 1,
            max: 10,
            required: true,
        },
    ],
};
//# sourceMappingURL=other.js.map