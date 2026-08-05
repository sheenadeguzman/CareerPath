/**
 * @file api.js
 * @description Stateless API service helper para sa CareerPath frontend client.
 * Dito nakalagay ang lahat ng client-side HTTP/Fetch requests papuntang backend API routes.
 */

/**
 * Helper function para i-process ang fetch responses at i-validate kung success o error.
 * Awtomatiko nitong ini-extract ang response body bilang JSON.
 */
async function handleResponse(response) {
  if (!response.ok) {
    // Pag may error, kuhanin ang error text galing sa server response kung mayroon
    const errorData = await response.json().catch(() => ({}));
    const errMsg = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
    throw new Error(errMsg);
  }
  return response.json();
}

/**
 * Kuhanin ang kumpletong dashboard sync data mula sa database.
 */
export async function fetchDashboardData(headers) {
  const response = await fetch('/api/data', { headers });
  return handleResponse(response);
}

/**
 * I-save o i-update ang alumni profile details.
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
 * I-save o i-update ang partner employer details.
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
 * I-save o i-update ang job vacancy posting.
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
 * I-save o i-update ang survey configuration (CHED Graduate Tracer surveys).
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
 * Isumite ang survey response ng isang alumnus.
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
 * Isumite ang quality curriculum o system feedback mula sa stakeholders.
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
 * Bulk import ng alumni records mula sa spreadsheet upload ng admin.
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
 * Burahin ang profile at user account ng isang alumnus.
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
 * Magpadala ng batch email reminders (nudge alerts) sa mga alumni.
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
 * Mag-invite ng bagong system user at gumawa ng login credentials.
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
 * Baguhin ang status (read/unread) ng notification base sa notification ID.
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
 * Burahin ang isang system user account.
 */
export async function deleteUser(userId, activeUserId, headers) {
  const response = await fetch('/api/delete-user', {
    method: 'POST',
    headers,
    body: JSON.stringify({ userId, activeUserId })
  });
  return handleResponse(response);
}

/**
 * Tawagin ang Gemini AI para sa matching analysis ng job at alumni candidates.
 */
export async function getGeminiMatch(job, matchedAlumni, headers) {
  const response = await fetch('/api/gemini-match', {
    method: 'POST',
    headers,
    body: JSON.stringify({ job, matchedAlumni })
  });
  return handleResponse(response);
}

/**
 * Tawagin ang Gemini AI upang ma-optimize ang "About Me" summary ng candidate.
 */
export async function aiOptimizeSummary(profile, headers) {
  const response = await fetch('/api/ai-optimize-summary', {
    method: 'POST',
    headers,
    body: JSON.stringify({ profile })
  });
  return handleResponse(response);
}

/**
 * Tawagin ang Gemini AI upang gumawa ng cover letter para sa napiling trabaho.
 */
export async function aiGenerateCoverLetter(profile, job, headers) {
  const response = await fetch('/api/ai-cover-letter', {
    method: 'POST',
    headers,
    body: JSON.stringify({ profile, job })
  });
  return handleResponse(response);
}

/**
 * Tawagin ang Gemini AI upang i-summarize ang feedback ng mga employers.
 */
export async function aiSummarizeFeedback(feedbacks, headers) {
  const response = await fetch('/api/ai-feedback-summary', {
    method: 'POST',
    headers,
    body: JSON.stringify({ feedbacks })
  });
  return handleResponse(response);
}

/**
 * Tawagin ang Gemini AI upang i-analyze ang survey responses.
 */
export async function aiAnalyzeSurveys(responses, headers) {
  const response = await fetch('/api/ai-survey-analytics', {
    method: 'POST',
    headers,
    body: JSON.stringify({ responses })
  });
  return handleResponse(response);
}

/**
 * Tawagin ang Gemini AI upang i-estimate ang employability score at career trajectory.
 */
export async function aiPredictPlacement(profile, headers) {
  const response = await fetch('/api/ai-predictive-placement', {
    method: 'POST',
    headers,
    body: JSON.stringify({ profile })
  });
  return handleResponse(response);
}