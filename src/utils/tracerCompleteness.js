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

  // Patakaran: Kung hindi pa na-access ang initial account (hindi pa nag-login)
  // AT wala pang sagot sa tracer (employmentStatus ay 'No Response' o blangko),
  // dapat ay 0% parin ang progress ("Not Yet Answered")!
  const hasLoggedIn = Boolean(alumni.hasLoggedIn || alumni.lastLogin);
  const hasAnsweredTracer = Boolean(
    alumni.employmentStatus && 
    alumni.employmentStatus !== 'No Response' && 
    alumni.employmentStatus !== 'Not Yet Answered'
  );

  // Kung hindi pa nag-login at wala pang naisusumiteng sagot sa tracer, 0% ang progress!
  if (!hasLoggedIn && !hasAnsweredTracer) {
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
