/**
 * @file mappers.js
 * @description Mappers para i-convert ang snake_case database rows papuntang camelCase frontend objects.
 */

import { decrypt } from './db.js';

/**
 * Mina-map ang database User rows papunta sa Frontend User objects.
 * @param {Object} row - Ang hilaw na user record mula sa MySQL database.
 * @returns {Object|null}
 */
export function mapUserFromDB(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    password: row.password,
    name: decrypt(row.name),
    email: row.email,
    role: row.role,
    isInitialPasswordNeeded: !!row.is_initial_password_needed,
    hasLoggedIn: !!row.has_logged_in,
    lastLogin: row.last_login || null,
    mfaEnabled: !!row.mfa_enabled,
    avatar: row.avatar,
    program: row.program,
    companyId: row.company_id,
    lastUsernameChange: row.last_username_change,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Mina-map ang database Alumni Profile rows papunta sa Frontend Alumni objects.
 * Pinapamahalaan din nito ang pag-parse ng skills list na naka-stringify (JSON array o split ng comma kapag may fallback).
 * @param {Object} row - Ang hilaw na record ng alumni mula sa MySQL.
 * @returns {Object|null}
 */
export function mapAlumniFromDB(row) {
  if (!row) return null;
  let skillsArr = [];
  if (row.skills) {
    try {
      skillsArr = JSON.parse(row.skills);
      if (!Array.isArray(skillsArr)) {
        skillsArr = row.skills.split(',').map(s => s.trim()).filter(Boolean);
      }
    } catch {
      skillsArr = row.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  let historyArr = [];
  if (row.career_history) {
    try {
      historyArr = JSON.parse(row.career_history);
      if (!Array.isArray(historyArr)) {
        historyArr = [];
      }
    } catch {
      historyArr = [];
    }
  }
  let educationArr = [];
  if (row.education_history) {
    try {
      educationArr = JSON.parse(row.education_history);
      if (!Array.isArray(educationArr)) {
        educationArr = [];
      }
    } catch {
      educationArr = [];
    }
  }
  let languagesStr = row.languages || '';
  if (languagesStr && languagesStr.startsWith('[')) {
    try {
      const parsed = JSON.parse(languagesStr);
      if (Array.isArray(parsed)) {
        languagesStr = parsed.join(', ');
      }
    } catch (e) {}
  }
  const decFirst = decrypt(row.first_name);
  const decMiddle = decrypt(row.middle_name) || '';
  const decLast = decrypt(row.last_name);

  // Alamin kung ang account ay nasa initial un-accessed status pa lamang:
  // Kung kailangan pa palitan ang initial password (is_initial_password_needed) at wala pang login o genuine tracer submission,
  // 5 columns lamang ang dapat nakatala sa kanila (Student ID, Name, Email, Program, Year Graduated).
  const hasGenuineTracerSubmission = Boolean(
    row.phone || 
    row.date_of_birth || 
    (row.employment_status === 'Employed' && (row.employer_name || row.job_title)) ||
    (row.employment_status === 'Unemployed' && (row.reasons_unemployment || row.phone || row.date_of_birth))
  );

  const isInitialPending = Boolean(
    (row.is_initial_password_needed && !row.last_login && !row.has_logged_in && !hasGenuineTracerSubmission) ||
    (!row.has_logged_in && !row.last_login && !hasGenuineTracerSubmission)
  );

  const hasLoggedIn = !isInitialPending && Boolean(row.has_logged_in || row.last_login || hasGenuineTracerSubmission);
  const employmentStatus = isInitialPending ? 'No Response' : (row.employment_status || 'No Response');

  return {
    studentId: row.student_id,
    name: [decFirst, decMiddle, decLast, row.suffix].filter(Boolean).join(' '),
    firstName: decFirst,
    middleName: decMiddle,
    lastName: decLast,
    suffix: row.suffix || '',
    email: row.email,
    phone: isInitialPending ? '' : (row.phone || ''),
    gender: isInitialPending ? '' : (row.gender || ''),
    civilStatus: isInitialPending ? '' : (row.civil_status || ''),
    dateOfBirth: (isInitialPending || !row.date_of_birth) ? '' : new Date(row.date_of_birth).toISOString().split('T')[0],
    address: isInitialPending ? '' : (row.address || ''),
    currentAddress: isInitialPending ? '' : (row.address || ''),
    permanentAddress: isInitialPending ? '' : (row.permanent_address || row.address || ''),
    program: row.program,
    yearEnrolled: isInitialPending ? null : (row.year_enrolled || null),
    yearGraduated: row.year_graduated,
    honors: isInitialPending ? 'None' : (row.honors || 'None'),
    professionalExamPassed: isInitialPending ? 'None' : (row.professional_exam_passed || 'None'),
    isBoardPasser: isInitialPending ? 'N/A' : (row.is_board_passer || 'N/A'),
    licensureExamDate: isInitialPending ? '' : (row.licensure_exam_date || ''),
    licenseNo: isInitialPending ? '' : (row.license_no || ''),
    alumniAssociationStatus: isInitialPending ? 'Non-Member' : (row.alumni_association_status || 'Non-Member'),
    employmentStatus: employmentStatus,
    jobTitle: isInitialPending ? '' : (row.job_title || ''),
    jobDescription: isInitialPending ? '' : (row.job_description || ''),
    employerName: isInitialPending ? '' : (row.employer_name || ''),
    employmentType: isInitialPending ? '' : (row.employment_type || ''),
    sector: isInitialPending ? 'N/A' : (row.sector || 'N/A'),
    monthlyIncome: isInitialPending ? '' : (row.monthly_income || ''),
    jobIndustry: isInitialPending ? '' : (row.job_industry || ''),
    jobRelatedToCourse: isInitialPending ? 'No' : (row.job_related_to_course || 'No'),
    firstJobRelatedToCourse: isInitialPending ? 'No' : (row.first_job_related_to_course || 'No'),
    timeToFirstJob: isInitialPending ? '' : (row.time_to_first_job || ''),
    jobStartYear: isInitialPending ? '' : (row.job_start_year || ''),
    skills: isInitialPending ? [] : skillsArr,
    isInitialPasswordNeeded: Boolean(row.is_initial_password_needed),
    hasLoggedIn: hasLoggedIn,
    lastLogin: isInitialPending ? null : (row.last_login || null),
    profileCompleteness: (() => {
      if (isInitialPending) {
        return 0;
      }
      if (typeof row.profile_completeness === 'number' && row.profile_completeness > 0) {
        return row.profile_completeness;
      }
      const isEmployed = ['Employed', 'Self-Employed', 'Freelance'].includes(employmentStatus);
      return isEmployed ? 85 : 72;
    })(),
    lastUpdated: row.last_updated,
    isRegistered: !isInitialPending && (row.profile_completeness || 0) >= 100,
    locationRegion: isInitialPending ? '' : (row.location_region || 'Local (Batanes)'),
    avatar: row.avatar || null,
    careerHistory: historyArr,
    educationHistory: educationArr,
    reasonsPursuingProgram: row.reasons_pursuing_program || '',
    findFirstJob: row.find_first_job || '',
    reasonsAcceptingJob: row.reasons_accepting_job || '',
    usefulSkills: (() => {
      if (row.useful_skills) {
        try { return JSON.parse(row.useful_skills); } catch { return []; }
      }
      return [];
    })(),
    reasonsUnemployment: row.reasons_unemployment || '',
    aboutMe: row.about_me || '',
    languages: languagesStr,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Mina-map ang database Partner Employer rows papunta sa Frontend Employer objects.
 * @param {Object} row - Ang hilaw na record ng employer mula sa MySQL.
 * @returns {Object|null}
 */
export function mapEmployerFromDB(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyName: row.company_name,
    industry: row.industry,
    address: row.address,
    email: row.email,
    phone: row.phone,
    contactPerson: row.contact_person,
    position: row.position,
    companySize: row.company_size,
    website: row.website || '',
    isVerified: !!row.is_verified,
    vacanciesCount: row.vacancies_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Mina-map ang database Job Posting rows papunta sa Frontend Job objects.
 * Pinapamahalaan ang pag-parse ng listahan ng requirements na naka-stringify (JSON array o split ng comma kapag may fallback).
 * @param {Object} row - Ang hilaw na record ng job vacancy mula sa MySQL.
 * @returns {Object|null}
 */
export function mapJobPostingFromDB(row) {
  if (!row) return null;
  let reqsArr = [];
  if (row.requirements) {
    try {
      reqsArr = JSON.parse(row.requirements);
      if (!Array.isArray(reqsArr)) {
        reqsArr = row.requirements.split(',').map(r => r.trim()).filter(Boolean);
      }
    } catch {
      reqsArr = row.requirements.split(',').map(r => r.trim()).filter(Boolean);
    }
  }
  return {
    id: row.id,
    jobTitle: row.job_title,
    employerName: row.employer_name,
    description: row.description,
    requirements: reqsArr,
    employmentType: row.employment_type,
    salaryRange: row.salary_range,
    location: row.location,
    slots: row.slots || 1,
    deadline: row.deadline ? new Date(row.deadline).toISOString().split('T')[0] : '',
    status: row.status,
    contactPerson: row.contact_person || '',
    contactEmail: row.contact_email || '',
    contactPhone: row.contact_phone || '',
    contactWebsite: row.contact_website || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Mina-map ang database Survey rows papunta sa Frontend Survey objects.
 * @param {Object} row - Ang hilaw na record ng survey mula sa MySQL.
 * @returns {Object|null}
 */
export function mapSurveyFromDB(row) {
  if (!row) return null;
  let qs = [];
  if (row.questions) {
    try {
      qs = JSON.parse(row.questions);
    } catch {
      qs = [];
    }
  }
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    startDate: row.start_date ? new Date(row.start_date).toISOString().split('T')[0] : '',
    endDate: row.end_date ? new Date(row.end_date).toISOString().split('T')[0] : '',
    status: row.status,
    questions: qs,
    responsesCount: row.responses_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Mina-map ang database Survey Response rows papunta sa Frontend SurveyResponse objects.
 * @param {Object} row - Ang hilaw na survey response record mula sa MySQL.
 * @returns {Object|null}
 */
export function mapSurveyResponseFromDB(row) {
  if (!row) return null;
  let ans = {};
  if (row.answers) {
    try {
      ans = JSON.parse(row.answers);
    } catch {
      ans = {};
    }
  }
  return {
    id: row.id,
    surveyId: row.survey_id,
    alumniId: row.alumni_id,
    alumniName: row.alumni_name,
    answers: ans,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}


/**
 * Mina-map ang database System Log rows papunta sa Frontend ActivityLog objects.
 * @param {Object} row - Ang hilaw na record ng audit log mula sa MySQL.
 * @returns {Object|null}
 */
export function mapLogFromDB(row) {
  if (!row) return null;
  return {
    id: row.id,
    timestamp: row.timestamp,
    userId: row.user_id,
    userEmail: row.user_email,
    userName: row.user_name,
    userRole: row.user_role,
    action: row.action,
    module: row.module,
    details: row.details,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Mina-map ang database Notification rows papunta sa Frontend Notification objects.
 * @param {Object} row - Ang hilaw na record ng notification mula sa MySQL.
 * @returns {Object|null}
 */
export function mapNotificationFromDB(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    text: row.text,
    date: row.date,
    read: !!row.read,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
