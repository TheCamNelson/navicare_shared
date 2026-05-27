import { CTASLevel, PathwayType } from "../types/triage.js";

export function mapCTASToPathway(ctas: CTASLevel): PathwayType {
  if (ctas === CTASLevel.LEVEL_1) return PathwayType.ED_DIRECT;
  if (ctas === CTASLevel.LEVEL_2) return PathwayType.EMERGENCY_DEPARTMENT;
  if (ctas === CTASLevel.LEVEL_3) return PathwayType.URGENT_CARE;
  if (ctas === CTASLevel.LEVEL_4) return PathwayType.URGENT_CARE;
  return PathwayType.HOME_CARE;
}
