/**
 * @file mappers.js
 * @description Mappers para i-convert ang snake_case database rows papuntang camelCase frontend objects.
 */

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
    name: row.name,
    email: row.email,
    role: row.role,
    isInitialPasswordNeeded: !!row.is_initial_password_needed,
    avatar: row.avatar,
    program: row.program,
    companyId: row.company_id
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
  return {
    studentId: row.student_id,
    name: [row.first_name, row.middle_name, row.last_name, row.suffix].filter(Boolean).join(' '),
    firstName: row.first_name,
    middleName: row.middle_name || '',
    lastName: row.last_name,
    suffix: row.suffix || '',
    email: row.email,
    phone: row.phone || '',
    gender: row.gender,
    civilStatus: row.civil_status,
    dateOfBirth: row.date_of_birth ? new Date(row.date_of_birth).toISOString().split('T')[0] : '',
    address: row.address || '',
    program: row.program,
    yearEnrolled: row.year_enrolled || null,
    yearGraduated: row.year_graduated,
    honors: row.honors || 'None',
    professionalExamPassed: row.professional_exam_passed || 'None',
    isBoardPasser: row.is_board_passer || 'N/A',
    licensureExamDate: row.licensure_exam_date || '',
    licenseNo: row.license_no || '',
    alumniAssociationStatus: row.alumni_association_status || 'Non-Member',
    employmentStatus: row.employment_status,
    jobTitle: row.job_title || '',
    jobDescription: row.job_description || '',
    employerName: row.employer_name || '',
    employmentType: row.employment_type || '',
    sector: row.sector || 'N/A',
    monthlyIncome: row.monthly_income || '',
    jobIndustry: row.job_industry || '',
    jobRelatedToCourse: row.job_related_to_course || 'No',
    firstJobRelatedToCourse: row.first_job_related_to_course || 'No',
    timeToFirstJob: row.time_to_first_job || '',
    skills: skillsArr,
    profileCompleteness: row.profile_completeness || 0,
    lastUpdated: row.last_updated,
    isRegistered: row.is_initial_password_needed === 0 || row.is_initial_password_needed === false,
    locationRegion: row.location_region || 'Local (Batanes)',
    avatar: row.avatar || null,
    careerHistory: historyArr,
    reasonsPursuingProgram: row.reasons_pursuing_program || '',
    findFirstJob: row.find_first_job || '',
    reasonsAcceptingJob: row.reasons_accepting_job || '',
    usefulSkills: (() => {
      if (row.useful_skills) {
        try { return JSON.parse(row.useful_skills); } catch { return []; }
      }
      return [];
    })(),
    reasonsUnemployment: row.reasons_unemployment || ''
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
    vacanciesCount: row.vacancies_count || 0
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
    status: row.status
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
    responsesCount: row.responses_count || 0
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
    submittedAt: row.submitted_at
  };
}

/**
 * Mina-map ang database Quality Feedback rows papunta sa Frontend Feedback objects.
 * @param {Object} row - Ang hilaw na record ng feedback mula sa MySQL.
 * @returns {Object|null}
 */
export function mapFeedbackFromDB(row) {
  if (!row) return null;
  return {
    id: row.id,
    subject: row.subject,
    category: row.category,
    message: row.message,
    rating: row.rating,
    submittedBy: row.submitted_by,
    alumniStudentId: row.alumni_student_id,
    alumniName: row.alumni_name,
    companyName: row.company_name,
    submittedAt: row.submitted_at
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
    details: row.details
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
    read: !!row.read
  };
}
