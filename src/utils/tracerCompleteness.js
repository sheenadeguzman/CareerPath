/**
 * @file tracerCompleteness.js
 * @description Centralized helper utility para sa pagkalkula ng tracer profile completeness.
 * 
 * Patakaran:
 * 1. Kung hindi pa nag-login ang alumnus AT wala pang nafi-fill up na anumang tracer fields
 *    (hal. bagong masterlist entry lamang na may studentId at pangalan), dapat 0% ang progress.
 * 2. Kapag may na-fill up na silang impormasyon (tulad ng phone, date of birth, address, 
 *    employment status, atbp.) o nag-login na sila, kakalkulahin ang kanilang totoong 
 *    profile completeness rate batay sa mga nasagutang fields.
 */

export function calculateProfileCompleteness(alumni) {
  if (!alumni) return 0;

  // Tinitingnan kung mayroon nang na-fill up na tracer fields
  const hasPhone = Boolean(alumni.phone && String(alumni.phone).trim());
  const hasDob = Boolean(alumni.dateOfBirth && String(alumni.dateOfBirth).trim());
  const hasAddr = Boolean((alumni.address && String(alumni.address).trim()) || (alumni.currentAddress && String(alumni.currentAddress).trim()) || (alumni.permanentAddress && String(alumni.permanentAddress).trim()));
  const hasEmpStatus = Boolean(alumni.employmentStatus && alumni.employmentStatus !== 'No Response' && alumni.employmentStatus !== 'Not Yet Answered');
  const hasSkills = Boolean((Array.isArray(alumni.skills) && alumni.skills.length > 0) || (Array.isArray(alumni.usefulSkills) && alumni.usefulSkills.length > 0));
  const hasJobTitle = Boolean(alumni.jobTitle && String(alumni.jobTitle).trim());

  const hasFilledContent = hasPhone || hasDob || hasAddr || hasEmpStatus || hasSkills || hasJobTitle || Boolean(alumni.hasLoggedIn);

  // Kung walang anumang na-fill up at hindi pa nag-login, panatilihin sa 0%
  if (!hasFilledContent) {
    return 0;
  }

  // Kung may na-save nang valid na progress na mas mataas sa 0%, gamitin ito
  if (typeof alumni.profileCompleteness === 'number' && alumni.profileCompleteness > 0) {
    return alumni.profileCompleteness;
  }

  // Kung may na-fill up na pero 0% ang nakatala (o na-reset), kalkulahin ang totoong percentage:
  let filledFields = 0;
  const fieldsToTrack = [
    'phone', 'gender', 'civilStatus', 'dateOfBirth', 'address', 'professionalExamPassed',
    'middleName', 'suffix', 'yearEnrolled', 'isBoardPasser'
  ];

  fieldsToTrack.forEach(field => {
    const val = alumni[field];
    if (val && String(val).trim() && val !== 'None' && val !== 'N/A') {
      filledFields++;
    }
  });

  if (alumni.permanentAddress || alumni.currentAddress || alumni.address) filledFields++;
  if (hasSkills) filledFields++;
  if (hasEmpStatus) filledFields++;

  const isEmployed = ['Employed', 'Self-Employed', 'Freelance'].includes(alumni.employmentStatus);
  if (isEmployed) {
    const empFields = [
      'jobTitle', 'jobDescription', 'employerName', 'employmentType', 'sector',
      'monthlyIncome', 'findFirstJob', 'reasonsAcceptingJob', 'jobIndustry', 'firstJobRelatedToCourse'
    ];
    empFields.forEach(field => {
      const val = alumni[field];
      if (val && String(val).trim() && val !== 'N/A') filledFields++;
    });
  }

  const totalPossibleFields = isEmployed ? 23 : 13;
  const calculated = Math.min(
    40 + Math.round((filledFields / totalPossibleFields) * 60),
    100
  );

  return calculated;
}
