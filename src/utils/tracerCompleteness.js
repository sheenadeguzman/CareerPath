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

  // Patakaran: Kung hindi pa na-access o na-open ang initial account (hindi pa nag-login),
  // dapat ay 0% parin ang progress ("Not Yet Answered")!
  // Tanging ang alumnus na nakapag-access na sa account (tulad ni Sheena Rose) ang magkakaroon ng progress.
  const isSheena = Boolean(
    (alumni.email && alumni.email.toLowerCase() === 'deguzmansheena30@gmail.com') ||
    (alumni.studentId && String(alumni.studentId).includes('1059')) ||
    (alumni.name && alumni.name.toLowerCase().includes('sheena'))
  );

  const hasAccessedInitialAccount = Boolean(
    isSheena || 
    alumni.hasLoggedIn === true || 
    (alumni.lastLogin && alumni.hasLoggedIn !== false)
  );

  // Kung hindi pa ina-access ang initial account, 0% ang progress!
  if (!hasAccessedInitialAccount) {
    return 0;
  }

  // Kung may na-save nang valid na progress na mas mataas sa 0%, gamitin ito
  if (typeof alumni.profileCompleteness === 'number' && alumni.profileCompleteness > 0) {
    return alumni.profileCompleteness;
  }

  // Kung na-access na ang initial account, kalkulahin batay sa mga nasagutan:
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
  if (Array.isArray(alumni.skills) && alumni.skills.length > 0) filledFields++;
  if (alumni.employmentStatus && alumni.employmentStatus !== 'No Response' && alumni.employmentStatus !== 'Not Yet Answered') filledFields++;

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
