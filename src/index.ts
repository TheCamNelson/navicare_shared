// Client-safe public API: types, pure functions, complaint configs, schemas.
// SERVER-ONLY: import { getStore } from "@navicare/shared/store" instead.

// Types
export * from "./types/index.js";

// Complaints
export { COMPLAINTS, getComplaint, BASELINE_QUESTIONS } from "./complaints/index.js";

// Triage (pure functions — no I/O)
export {
  runTriage,
  ALGORITHM_VERSION,
  type RunTriageInput,
  checkGlobalRedFlags,
  type GlobalRedFlag,
  evaluateFirstOrderModifiers,
  evaluateSecondOrderModifiers,
  applyPopulationModifiers,
  applyAutoEscalationRules,
  mapCTASToPathway,
  mapPainToCTAS,
  SECOND_ORDER_EVALUATORS,
} from "./triage/index.js";

// State machine (pure)
export {
  VALID_TRANSITIONS,
  canTransition,
  transitionState,
  InvalidStateTransitionError,
} from "./state-machine/index.js";

// AI (client-safe — scripted bot + advisor stub)
export {
  ScriptedTriageBot,
  type BotStep,
  generateAdvisorOpinion,
  type AdvisorOpinion,
} from "./ai/index.js";

// Schemas (Zod — client-safe)
export {
  BaselineSchema,
  IntakeDataSchema,
  ComplaintResponseSchemas,
  validateIntake,
} from "./schemas/index.js";

// Helpers
export { calculateAge, getAgeGroup } from "./types/patient.js";

// Store types (interfaces only — implementations live in /store subpath)
export type {
  DataStore,
  PatientCreateInput,
  EncounterCreateInput,
  QueueListFilter,
  StoreEventCallback,
  StoreTable,
} from "./store/types.js";
