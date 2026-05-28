import { ComplaintCode } from "../types/complaint.js";
import { chestPainConfig } from "./chest-pain.js";
import { abdominalConfig } from "./abdominal.js";
import { headacheConfig } from "./headache.js";
import { feverConfig } from "./fever.js";
import { breathingConfig } from "./breathing.js";
import { injuryConfig } from "./injury.js";
import { allergicConfig } from "./allergic.js";
import { mentalHealthConfig } from "./mental-health.js";
import { pediatricConfig } from "./pediatric.js";
import { skinWoundConfig } from "./skin-wound.js";
import { backJointConfig } from "./back-joint.js";
import { urinaryReproConfig } from "./urinary-repro.js";
import { eyeEntConfig } from "./eye-ent.js";
import { otherConfig } from "./other.js";
export const COMPLAINTS = {
    [ComplaintCode.CHEST_PAIN]: chestPainConfig,
    [ComplaintCode.ABDOMINAL]: abdominalConfig,
    [ComplaintCode.HEADACHE]: headacheConfig,
    [ComplaintCode.FEVER]: feverConfig,
    [ComplaintCode.BREATHING]: breathingConfig,
    [ComplaintCode.INJURY]: injuryConfig,
    [ComplaintCode.ALLERGIC]: allergicConfig,
    [ComplaintCode.MENTAL_HEALTH]: mentalHealthConfig,
    [ComplaintCode.PEDIATRIC]: pediatricConfig,
    [ComplaintCode.SKIN_WOUND]: skinWoundConfig,
    [ComplaintCode.BACK_JOINT]: backJointConfig,
    [ComplaintCode.URINARY_REPRO]: urinaryReproConfig,
    [ComplaintCode.EYE_ENT]: eyeEntConfig,
    [ComplaintCode.OTHER]: otherConfig,
};
export function getComplaint(code) {
    const config = COMPLAINTS[code];
    if (!config) {
        throw new Error(`Unknown complaint code: ${code}`);
    }
    return config;
}
export { BASELINE_QUESTIONS } from "./baseline-questions.js";
//# sourceMappingURL=index.js.map