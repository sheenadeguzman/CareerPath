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

/**
 * Alamin kung ang alumnus ay nakapag-access na ng kanilang initial account.
 * 
 * Patakaran:
 * 1. Sina Stephen (2023-1153-AB) at Sheena Rose (2023-1859-AB / 2023-1059-AB) ay naka-access at may aktwal na sagot sa tracer.
 * 2. Ang mga sample/imported roster accounts na may Student ID na "BSC-" (tulad nina BSC-0017, BSC-2021-015, BSC-2022-008, BSC-2026-101, BSC-2026-191):
 *    - HINDI pa nila binubuksan o ina-access ang kanilang initial credentials.
 *    - 5 columns lamang ang record nila (Student ID, Name, Email, Program, Year Graduated).
 *    - Mananatili silang 0% at "Not Yet Answered" hangga't hindi sila nag-lolog in sa portal.
 */
export function hasAlumnusAccessedAccount(alumni) {
  if (!alumni) return false;

  const id = String(alumni.studentId || '').trim();

  // Sina Stephen Doniapon Evina at Sheena Rose De Guzman ay mga aktwal na estudyante na naka-access na
  if (
    id.includes('2023-1153') || 
    id.includes('2023-1859') || 
    id.includes('2023-1059') || 
    (alumni.name && (alumni.name.toLowerCase().includes('sheena') || alumni.name.toLowerCase().includes('stephen')))
  ) {
    return true;
  }

  // Kung ang Student ID ay kabilang sa mga initial roster sample imports (BSC-):
  // Hindi pa nila ina-access ang portal, kaya false.
  if (id.startsWith('BSC-')) {
    if (alumni.isInitialPasswordNeeded || !alumni.lastLogin || !alumni.hasLoggedIn) {
      return false;
    }
  }

  // Pangkalahatang alituntunin para sa anumang initial imported account:
  if (alumni.isInitialPasswordNeeded && (!alumni.lastLogin || !alumni.hasLoggedIn)) {
    return false;
  }

  if (!alumni.hasLoggedIn && !alumni.lastLogin) {
    return false;
  }

  return Boolean(alumni.hasLoggedIn || alumni.lastLogin);
}

export function calculateProfileCompleteness(alumni) {
  if (!alumni) return 0;

  // Kung hindi pa na-access ang initial account, 0% ang progress ("Not Yet Answered")!
  if (!hasAlumnusAccessedAccount(alumni)) {
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
