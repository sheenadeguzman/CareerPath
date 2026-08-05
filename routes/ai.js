/**
 * @file ai.js
 * @description Express Router para sa Gemini AI integrations (Free Tier).
 * Pinapamahalaan nito ang pag-communicate sa Google Gemini API gamit ang @google/genai SDK.
 */

import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { authenticateToken } from './middleware.js';

const router = express.Router();

const modelsToTry = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3-flash', 'gemini-2.5-flash'];

/**
 * Robust helper function to execute prompt calls on available Gemini models in sequence.
 */
async function callGemini(ai, prompt) {
  let lastError = null;
  for (const modelName of modelsToTry) {
    try {
      console.log(`Subukang tawagan ang Gemini gamit ang model: ${modelName}`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
      });
      const text = response.text;
      if (text) {
        console.log(`Matagumpay na nakonekta gamit ang ${modelName}!`);
        return text;
      }
    } catch (err) {
      console.warn(`Failed with model ${modelName}:`, err.message);
      lastError = err;
    }
  }
  throw new Error(lastError ? lastError.message : 'Hindi nakakonekta sa anumang Gemini models.');
}

/**
 * POST /api/gemini-match
 * Pinaproseso ang pagtutugma ng bakanteng trabaho (Job Vacancy) at mga alumni candidates gamit ang Gemini AI.
 * Nagbabalik ito ng markdown analysis, curriculum recommendations, at recruitment message draft.
 */
router.post('/gemini-match', authenticateToken, async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(400).json({ error: 'API_KEY_MISSING' });
    }

    const { job, matchedAlumni } = req.body;
    if (!job || !matchedAlumni) {
      return res.status(400).json({ error: 'Missing job details or candidate list.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const alumniListString = matchedAlumni.slice(0, 5).map((item, idx) => {
      const al = item.alumni;
      return `${idx + 1}. Pangalan: ${al.name}
   - Student ID: ${al.studentId}
   - Kurso: ${al.program} (${al.yearGraduated})
   - Skills sa Record: ${al.skills ? al.skills.join(', ') : 'Wala'}
   - Employment Status: ${al.employmentStatus || 'N/A'}
   - Impormasyon/About Me: ${al.aboutMe || 'N/A'}
   - Kasalukuyang Heuristic Match Score: ${item.hybridScore}%`;
    }).join('\n\n');

    const prompt = `
You are an expert AI Career and Education Consultant for Batanes State College (BSC).
Analyze the following job vacancy and the list of top matching graduates (alumni).

=== JOB DETAILS ===
Employer: ${job.employerName}
Job Title: ${job.jobTitle}
Description: ${job.description}
Prerequisite Skills Required: ${job.requirements ? job.requirements.join(', ') : 'N/A'}

=== TOP MATCHING GRADUATES (ALUMNI) ===
${alumniListString}

Based on this information, please provide a professional analysis containing exactly these three parts:

1. ## AI Candidate Match & Fit Analysis
Analyze why these specific graduates are good fits, which candidate stands out as the strongest fit, and explain any skill advantages they possess. Write this analysis in professional, friendly English.

2. ## Curriculum & Syllabus Gap Recommendations
Provide actionable recommendations for Batanes State College (BSC) on how to improve its curriculum. Based on what the employer requires and what graduates lack, specify which modern technologies, methodologies, or specific topics should be integrated into the syllabus (e.g. BSIT, BSHM, BSED, etc.) to bridge this gap.

3. ## Draft Invitation Message for Employer
Provide a ready-to-copy recruitment/invitation email or chat message draft (written in professional English) that the employer can send to their top recommended candidate to invite them for an interview or discuss the vacancy.

Guidelines:
- Output your response in clean, standard markdown.
- Use clear headings (##), sub-headings (###), and bullet points.
- Keep the tone professional, encouraging, and supportive of the academic growth of BSC.
- Do not use complex tables or nested HTML tags.
- Keep it concise, focused, and directly actionable.
`;

    const text = await callGemini(ai, prompt);
    res.json({ success: true, analysis: text });

  } catch (err) {
    console.error('Gemini API Integration Error:', err);
    res.status(500).json({ error: 'FAILED_TO_CALL_GEMINI', message: err.message });
  }
});

/**
 * POST /api/ai-optimize-summary
 * Binabago ang "About Me" summary ng alumnus upang maging mas kaakit-akit at propesyonal para sa mga kumpanya.
 */
router.post('/ai-optimize-summary', authenticateToken, async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(400).json({ error: 'API_KEY_MISSING' });
    }

    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'Missing profile details.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are a professional resume writer.
Rewrite the "About Me" summary for this candidate to make it highly professional, attractive to employers, and corporate-ready.

Candidate details:
- Name: ${profile.name}
- Program: ${profile.program} (Graduated: ${profile.yearGraduated})
- Skills: ${profile.skills ? profile.skills.join(', ') : 'None'}
- Current Summary/About Me: ${profile.aboutMe || 'None'}
- Languages: ${profile.languages || 'None'}

Guidelines:
- Return ONLY the generated summary (1 paragraph, around 3-4 sentences). Do not include any intro, headings, quotes, or conversational text.
- Highlight their key competencies and potential.
- Write it in professional English.
`;

    const text = await callGemini(ai, prompt);
    res.json({ success: true, summary: text });

  } catch (err) {
    console.error('AI Summary Error:', err);
    res.status(500).json({ error: 'FAILED_TO_CALL_GEMINI', message: err.message });
  }
});

/**
 * POST /api/ai-cover-letter
 * Gumagawa ng custom at pormal na cover letter batay sa napiling trabaho at profile ng alumnus.
 */
router.post('/ai-cover-letter', authenticateToken, async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(400).json({ error: 'API_KEY_MISSING' });
    }

    const { profile, job } = req.body;
    if (!profile || !job) {
      return res.status(400).json({ error: 'Missing profile or job details.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are a career assistant helping a graduate write a cover letter.
Write a formal, tailored cover letter in English for this job application.

Candidate Details:
- Name: ${profile.name}
- Email: ${profile.email}
- Program: ${profile.program} (Graduated: ${profile.yearGraduated})
- Skills: ${profile.skills ? profile.skills.join(', ') : 'None'}
- About Me: ${profile.aboutMe || 'None'}

Job Vacancy Details:
- Employer: ${job.employerName}
- Position: ${job.jobTitle}
- Description: ${job.description}
- Requirements: ${job.requirements ? job.requirements.join(', ') : 'None'}

Guidelines:
- Output the cover letter in professional standard business letter format.
- Make it enthusiastic, tailored, and highlight how the candidate's skills align with the job requirements.
- Keep it to 3-4 paragraphs.
- Do not use complex tables or markdown formatting. Use plain paragraphs.
`;

    const text = await callGemini(ai, prompt);
    res.json({ success: true, coverLetter: text });

  } catch (err) {
    console.error('AI Cover Letter Error:', err);
    res.status(500).json({ error: 'FAILED_TO_CALL_GEMINI', message: err.message });
  }
});

/**
 * POST /api/ai-feedback-summary
 * Gumagawa ng SWOT analysis at syllabus improvement recommendations batay sa employer feedbacks.
 */
router.post('/ai-feedback-summary', authenticateToken, async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(400).json({ error: 'API_KEY_MISSING' });
    }

    const { feedbacks } = req.body;
    if (!feedbacks || feedbacks.length === 0) {
      return res.status(400).json({ error: 'No feedbacks provided.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const feedbackList = feedbacks.map((f, i) => {
      return `${i+1}. Category: ${f.category || 'Curriculum'}
   Topic: ${f.title}
   Rating: ${f.rating}/5
   Comments: ${f.message}`;
    }).join('\n\n');

    const prompt = `
You are an educational quality auditor.
Analyze the following curriculum feedback submitted by employers and stakeholders:

${feedbackList}

Based on this data, write a professional audit report in English containing exactly these two parts:
1. ## SWOT Analysis
- **Strengths**: What are they rating highly or praising?
- **Weaknesses**: What gaps, issues, or complaints are mentioned?
- **Opportunities**: What emerging fields, technologies, or training areas should be targeted?
- **Threats**: Risks to graduate employability if the curriculum remains outdated.

2. ## Curriculum & Syllabus Improvement Action Plan
Specific, actionable changes that Batanes State College should integrate into their department courses (such as BSIT, BSHM, BSED, etc.) to bridge the competency gap.
`;

    const text = await callGemini(ai, prompt);
    res.json({ success: true, summary: text });

  } catch (err) {
    console.error('AI Feedback Summary Error:', err);
    res.status(500).json({ error: 'FAILED_TO_CALL_GEMINI', message: err.message });
  }
});

/**
 * POST /api/ai-survey-analytics
 * Pinaproseso ang qualitative answers ng survey upang makita ang sentiment at employment trends.
 */
router.post('/ai-survey-analytics', authenticateToken, async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(400).json({ error: 'API_KEY_MISSING' });
    }

    const { responses } = req.body;
    if (!responses || responses.length === 0) {
      return res.status(400).json({ error: 'No survey responses to analyze.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const responsesList = responses.map((r, i) => {
      return `${i+1}. Survey: ${r.surveyTitle}
   Status: ${r.answers ? JSON.stringify(r.answers) : 'No detail'}`;
    }).join('\n\n');

    const prompt = `
You are an educational data analyst.
Analyze the following survey responses from graduates:

${responsesList}

Provide a thematic summary of their employment trends, satisfaction levels, and sentiment in English.
Format your response using exactly these three headings:
## Key Themes & Findings
## Graduate Sentiment Summary
## Recommendations for Improvement
`;

    const text = await callGemini(ai, prompt);
    res.json({ success: true, analysis: text });

  } catch (err) {
    console.error('AI Survey Analysis Error:', err);
    res.status(500).json({ error: 'FAILED_TO_CALL_GEMINI', message: err.message });
  }
});

/**
 * POST /api/ai-predictive-placement
 * Nagbibigay ng simulated employability index, target career path, at tips base sa credential tags.
 */
router.post('/ai-predictive-placement', authenticateToken, async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(400).json({ error: 'API_KEY_MISSING' });
    }

    const { profile } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'Missing profile.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are a predictive career placement algorithm.
Analyze the alumnus's profile:
- Course/Program: ${profile.program} (Graduated: ${profile.yearGraduated})
- Skills: ${profile.skills ? profile.skills.join(', ') : 'None'}
- Employment Status: ${profile.employmentStatus || 'Unemployed'}
- About Me: ${profile.aboutMe || 'None'}

Predict their:
1. Employability Index (a score from 0% to 100% on how easily/quickly they can get hired in their target industry).
2. Top 3 matching Job Roles.
3. Estimated time-to-hire (e.g. 1-3 months).
4. Actionable tips to increase their score.

Guidelines:
- Format your response in clean markdown with exactly these headings:
## Employability Index: [Score]%
## Matching Job Roles
## Estimated Placement Speed
## Career Acceleration Tips
- Write it in English. Keep it motivating and professional.
`;

    const text = await callGemini(ai, prompt);
    res.json({ success: true, prediction: text });

  } catch (err) {
    console.error('AI Predictive Placement Error:', err);
    res.status(500).json({ error: 'FAILED_TO_CALL_GEMINI', message: err.message });
  }
});

export default router;
