import { randomUUID } from "node:crypto";
import { getComplaint } from "../complaints/index.js";
import type { Encounter } from "../types/encounter.js";
import type { IntakeData } from "../types/intake.js";
import type { Patient } from "../types/patient.js";
import {
  CTASLevel,
  PathwayType,
  type ModifierEntry,
  type TriageResult,
} from "../types/triage.js";
import { checkGlobalRedFlags } from "./global-red-flags.js";
import { evaluateFirstOrderModifiers } from "./first-order-modifiers.js";
import { evaluateSecondOrderModifiers } from "./second-order-modifiers.js";
import { applyPopulationModifiers } from "./population-modifiers.js";
import { applyAutoEscalationRules } from "./auto-escalation.js";
import { mapCTASToPathway } from "./pathway-mapping.js";

export const ALGORITHM_VERSION = "1.0.0";

export interface RunTriageInput {
  encounter: Encounter;
  intake: IntakeData;
  patient: Patient;
}

export function runTriage(input: RunTriageInput): TriageResult {
  const { encounter, intake, patient } = input;

  if (!encounter.complaint_code) {
    throw new Error("Encounter must have a complaint_code before triage");
  }

  // Step 1: Global red flag screen
  const globalFlags = checkGlobalRedFlags(intake, encounter, patient);
  if (globalFlags.length > 0) {
    return {
      id: randomUUID(),
      encounter_id: encounter.id,
      algorithm_version: ALGORITHM_VERSION,
      methodology: "eCTAS_VTriage_v1",
      global_red_flags_triggered: globalFlags.map((f) => f.name),
      complaint_red_flags: [],
      first_order_modifiers: [],
      second_order_modifiers: [],
      population_modifiers_applied: [],
      complaint_derived_ctas: CTASLevel.LEVEL_1,
      final_ctas_level: CTASLevel.LEVEL_1,
      recommended_pathway: PathwayType.ED_DIRECT,
      bypass_queue: true,
      up_triage_applied: false,
      instructions: globalFlags[0]!.instructions,
      created_at: new Date(),
    };
  }

  // Step 2: First-order modifiers
  const firstOrder = evaluateFirstOrderModifiers(
    encounter.complaint_code,
    intake,
  );

  // Step 3: Second-order modifiers
  const secondOrder = evaluateSecondOrderModifiers(
    encounter.complaint_code,
    intake,
  );

  // Step 4: Highest-acuity-wins
  const allModifiers: ModifierEntry[] = [...firstOrder, ...secondOrder];
  let complaintCTAS: CTASLevel;
  if (allModifiers.length > 0) {
    const min = Math.min(...allModifiers.map((m) => m.ctas_impact));
    complaintCTAS = min as CTASLevel;
  } else {
    complaintCTAS = getComplaint(encounter.complaint_code).defaultCTAS;
  }

  // Step 5: Population modifiers
  const populationResult = applyPopulationModifiers(
    complaintCTAS,
    intake,
    encounter,
    patient,
  );

  // Step 6: Auto-escalation safety rules
  const finalCTAS = applyAutoEscalationRules(
    populationResult.ctas,
    encounter,
    intake,
  );

  // Step 7: Pathway mapping
  const pathway = mapCTASToPathway(finalCTAS);

  return {
    id: randomUUID(),
    encounter_id: encounter.id,
    algorithm_version: ALGORITHM_VERSION,
    methodology: "eCTAS_VTriage_v1",
    global_red_flags_triggered: [],
    complaint_red_flags: secondOrder,
    first_order_modifiers: firstOrder,
    second_order_modifiers: secondOrder,
    population_modifiers_applied: populationResult.modifiers,
    complaint_derived_ctas: complaintCTAS,
    final_ctas_level: finalCTAS,
    recommended_pathway: pathway,
    bypass_queue: finalCTAS === CTASLevel.LEVEL_1,
    up_triage_applied: finalCTAS < complaintCTAS,
    created_at: new Date(),
  };
}
