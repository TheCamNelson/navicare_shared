export var AgeGroup;
(function (AgeGroup) {
    AgeGroup["INFANT"] = "INFANT";
    AgeGroup["TODDLER"] = "TODDLER";
    AgeGroup["PEDIATRIC"] = "PEDIATRIC";
    AgeGroup["ADULT"] = "ADULT";
    AgeGroup["SENIOR"] = "SENIOR";
    AgeGroup["ELDERLY"] = "ELDERLY";
})(AgeGroup || (AgeGroup = {}));
export var InsuranceStatus;
(function (InsuranceStatus) {
    InsuranceStatus["OHIP_ACTIVE"] = "OHIP_ACTIVE";
    InsuranceStatus["OHIP_EXPIRED"] = "OHIP_EXPIRED";
    InsuranceStatus["UNINSURED"] = "UNINSURED";
})(InsuranceStatus || (InsuranceStatus = {}));
export function getAgeGroup(age) {
    if (age < 1)
        return AgeGroup.INFANT;
    if (age < 2)
        return AgeGroup.TODDLER;
    if (age < 16)
        return AgeGroup.PEDIATRIC;
    if (age < 65)
        return AgeGroup.ADULT;
    if (age < 80)
        return AgeGroup.SENIOR;
    return AgeGroup.ELDERLY;
}
export function calculateAge(dob, today = new Date()) {
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age -= 1;
    }
    return age;
}
//# sourceMappingURL=patient.js.map