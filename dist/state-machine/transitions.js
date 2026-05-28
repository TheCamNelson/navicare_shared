import { EncounterState } from "../types/encounter.js";
export const VALID_TRANSITIONS = {
    [EncounterState.CREATED]: [
        EncounterState.IDENTITY_VERIFIED,
        EncounterState.REJECTED,
        EncounterState.ABANDONED,
    ],
    [EncounterState.IDENTITY_VERIFIED]: [
        EncounterState.INTAKE_IN_PROGRESS,
        EncounterState.ABANDONED,
    ],
    [EncounterState.INTAKE_IN_PROGRESS]: [
        EncounterState.INTAKE_COMPLETE,
        EncounterState.ABANDONED,
    ],
    [EncounterState.INTAKE_COMPLETE]: [EncounterState.TRIAGE_PROCESSING],
    [EncounterState.TRIAGE_PROCESSING]: [
        EncounterState.TRIAGE_COMPLETE,
        EncounterState.TRIAGE_ERROR,
    ],
    [EncounterState.TRIAGE_ERROR]: [EncounterState.IN_QUEUE],
    [EncounterState.TRIAGE_COMPLETE]: [
        EncounterState.ED_DIRECT,
        EncounterState.IN_QUEUE,
    ],
    [EncounterState.IN_QUEUE]: [
        EncounterState.CLINICIAN_ASSIGNED,
        EncounterState.ABANDONED,
        EncounterState.ESCALATED,
    ],
    [EncounterState.ESCALATED]: [EncounterState.CLINICIAN_ASSIGNED],
    [EncounterState.CLINICIAN_ASSIGNED]: [EncounterState.CLINICIAN_REVIEW],
    [EncounterState.CLINICIAN_REVIEW]: [
        EncounterState.PATHWAY_ASSIGNED,
        EncounterState.CLINICIAN_ASSIGNED,
    ],
    [EncounterState.PATHWAY_ASSIGNED]: [
        EncounterState.HOME_CARE_IN_PROGRESS,
        EncounterState.URGENT_CARE_IN_PROGRESS,
        EncounterState.ED_IN_PROGRESS,
    ],
    [EncounterState.ED_DIRECT]: [EncounterState.ED_IN_PROGRESS],
    [EncounterState.HOME_CARE_IN_PROGRESS]: [EncounterState.COMPLETED],
    [EncounterState.URGENT_CARE_IN_PROGRESS]: [
        EncounterState.COMPLETED,
        EncounterState.ED_IN_PROGRESS,
    ],
    [EncounterState.ED_IN_PROGRESS]: [EncounterState.COMPLETED],
    [EncounterState.COMPLETED]: [],
    [EncounterState.ABANDONED]: [],
    [EncounterState.REJECTED]: [],
};
export class InvalidStateTransitionError extends Error {
    constructor(from, to) {
        super(`Cannot transition from ${from} to ${to}`);
        this.name = "InvalidStateTransitionError";
    }
}
export function canTransition(from, to) {
    return VALID_TRANSITIONS[from].includes(to);
}
export function transitionState(encounter, newState) {
    if (!canTransition(encounter.state, newState)) {
        throw new InvalidStateTransitionError(encounter.state, newState);
    }
    const now = new Date();
    const next = {
        ...encounter,
        state: newState,
        updated_at: now,
    };
    if (newState === EncounterState.COMPLETED) {
        next.completed_at = now;
    }
    if (newState === EncounterState.ABANDONED) {
        next.abandoned_at = now;
    }
    return next;
}
//# sourceMappingURL=transitions.js.map