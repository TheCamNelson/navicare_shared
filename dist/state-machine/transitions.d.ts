import { EncounterState, type Encounter } from "../types/encounter.js";
export declare const VALID_TRANSITIONS: Record<EncounterState, EncounterState[]>;
export declare class InvalidStateTransitionError extends Error {
    constructor(from: EncounterState, to: EncounterState);
}
export declare function canTransition(from: EncounterState, to: EncounterState): boolean;
export declare function transitionState(encounter: Encounter, newState: EncounterState): Encounter;
//# sourceMappingURL=transitions.d.ts.map