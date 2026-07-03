/**
 * @file api.js
 * @description Stateless API service helper for the CareerPath frontend.
 */

/**
 * Helper to handle fetch responses and handle JSON conversion.
 */
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

/**
 * Fetch all sync collections from the backend.
 */
export async function fetchDashboardData() {
  const response = await fetch('/api/data');
  return handleResponse(response);
}

/**
 * Save or update alumni profile.
 */
export async function saveAlumni(profile, activeUserId, headers) {
  const response = await fetch('/api/save-alumni', {
    method: 'POST',
    headers,
    body: JSON.stringify({ profile, activeUserId })
  });
  return handleResponse(response);
}

/**
 * Save or update employer details.
 */
export async function saveEmployer(employer, activeUserId, headers) {
  const response = await fetch('/api/save-employer', {
    method: 'POST',
    headers,
    body: JSON.stringify({ employer, activeUserId })
  });
  return handleResponse(response);
}

/**
 * Save or update job posting.
 */
export async function saveJob(job, activeUserId, headers) {
  const response = await fetch('/api/save-job', {
    method: 'POST',
    headers,
    body: JSON.stringify({ job, activeUserId })
  });
  return handleResponse(response);
}

/**
 * Save or update CHED Graduate Tracer survey.
 */
export async function saveSurvey(survey, activeUserId, headers) {
  const response = await fetch('/api/save-survey', {
    method: 'POST',
    headers,
    body: JSON.stringify({ survey, activeUserId })
  });
  return handleResponse(response);
}

/**
 * Submit survey response.
 */
export async function submitSurveyResponse(surveyId, alumniId, alumniName, answers, headers) {
  const response = await fetch('/api/submit-survey-response', {
    method: 'POST',
    headers,
    body: JSON.stringify({ surveyId, alumniId, alumniName, answers })
  });
  return handleResponse(response);
}

/**
 * Submit curriculum/system feedback.
 */
export async function submitFeedback(feedback, activeUserId, headers) {
  const response = await fetch('/api/submit-feedback', {
    method: 'POST',
    headers,
    body: JSON.stringify({ feedback, activeUserId })
  });
  return handleResponse(response);
}

/**
 * Bulk import alumni records.
 */
export async function bulkImportAlumni(rows, activeUserId, headers) {
  const response = await fetch('/api/import-alumni', {
    method: 'POST',
    headers,
    body: JSON.stringify({ rows, activeUserId })
  });
  return handleResponse(response);
}

/**
 * Delete alumni profile.
 */
export async function deleteAlumni(studentId, activeUserId, headers) {
  const response = await fetch('/api/delete-alumni', {
    method: 'POST',
    headers,
    body: JSON.stringify({ studentId, activeUserId })
  });
  return handleResponse(response);
}

/**
 * Dispatch batch email reminders.
 */
export async function sendBatchReminders(targetAlumniIds, activeUserId, customSubject, customBody, headers) {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers,
    body: JSON.stringify({ targetAlumniIds, activeUserId, customSubject, customBody })
  });
  return handleResponse(response);
}

/**
 * Invite user and create SIAS login credentials.
 */
export async function inviteUserByEmail(email, role, activeUserId, headers) {
  const response = await fetch('/api/invite-user', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, role, activeUserId })
  });
  return handleResponse(response);
}

/**
 * Toggle notification read status.
 */
export async function toggleNotificationRead(id, read, headers) {
  const response = await fetch('/api/toggle-notification-read', {
    method: 'POST',
    headers,
    body: JSON.stringify({ id, read })
  });
  return handleResponse(response);
}

/**
 * Delete system user.
 */
export async function deleteUser(userId, activeUserId, headers) {
  const response = await fetch('/api/delete-user', {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId, activeUserId })
  });
  return handleResponse(response);
}