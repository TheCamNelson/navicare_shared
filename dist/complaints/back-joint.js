import { ComplaintCode } from "../types/complaint.js";
import { CTASLevel } from "../types/triage.js";
export const backJointConfig = {
    code: ComplaintCode.BACK_JOINT,
    label: "Back or Joint Pain",
    description: "Back pain, knee pain, shoulder pain, stiffness",
    defaultCTAS: CTASLevel.LEVEL_4,
    questions: [
        {
            id: "location",
            prompt: "Location of pain (specific back region or joint)?",
            type: "text",
            required: true,
        },
        {
            id: "preceding_injury",
            prompt: "Was there a preceding injury?",
            type: "yesno",
            required: true,
        },
        {
            id: "numbness",
            prompt: "Numbness or tingling in legs or arms?",
            type: "yesno",
            required: true,
        },
        {
            id: "bladder_bowel",
            prompt: "Any change in bladder or bowel control?",
            type: "yesno",
            required: true,
        },
        {
            id: "joint_swollen",
            prompt: "Is the joint swollen, red, or warm?",
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
            id: "can_walk",
            prompt: "Can you walk?",
            type: "yesno",
            required: true,
        },
        {
            id: "weakness",
            prompt: "Weakness in legs or arms?",
            type: "yesno",
            required: true,
        },
        {
            id: "bilateral_weakness",
            prompt: "Is weakness in BOTH legs or BOTH arms?",
            type: "yesno",
            required: false,
            showIf: (r) => r["weakness"] === true || r["weakness"] === "Yes",
        },
        {
            id: "cancer_history",
            prompt: "History of cancer?",
            type: "yesno",
            required: true,
        },
        {
            id: "weight_loss",
            prompt: "Unexplained weight loss?",
            type: "yesno",
            required: true,
        },
    ],
};
//# sourceMappingURL=back-joint.js.map