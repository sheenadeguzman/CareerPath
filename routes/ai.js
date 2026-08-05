/**
 * @file ai.js
 * @description Express Router para sa Gemini AI integrations (Free Tier).
 * Pinapamahalaan nito ang pag-communicate sa Google Gemini API gamit ang @google/genai SDK.
 */

import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { authenticateToken } from './middleware.js';

const router = express.Router();

/**
 * POST /api/gemini-match
 * Pinaproseso ang pagtutugma ng bakanteng trabaho (Job Vacancy) at mga alumni candidates gamit ang Gemini AI.
 * Nagbabalik ito ng markdown analysis, curriculum recommendations, at recruitment message draft.
 */
router.post('/gemini-match', authenticateToken, async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    // Kapag walang API Key sa environment, ibalik ang malinaw na error code
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return res.status(400).json({ error: 'API_KEY_MISSING' });
    }

    const { job, matchedAlumni } = req.body;

    if (!job || !matchedAlumni) {
      return res.status(400).json({ error: 'Missing job details or candidate list.' });
    }

    // Initialize ang GoogleGenAI client gamit ang API key
    const ai = new GoogleGenAI({ apiKey });

    // I-format ang top candidates para sa prompt
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

    let response;
    let text;

    // Subukang tawagan ang Gemini gamit ang pinakabagong models (may fallbacks para sa robustness)
    const modelsToTry = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3-flash', 'gemini-2.5-flash'];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Subukang tawagan ang Gemini gamit ang model: ${modelName}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });
        text = response.text;
        if (text) {
          console.log(`Matagumpay na nakonekta gamit ang ${modelName}!`);
          break;
        }
      } catch (err) {
        console.warn(`Failed with model ${modelName}:`, err.message);
        lastError = err;
      }
    }

    if (!text) {
      throw new Error(lastError ? lastError.message : 'Hindi nakakonekta sa anumang Gemini models.');
    }

    res.json({
      success: true,
      analysis: text
    });

  } catch (err) {
    console.error('Gemini API Integration Error:', err);
    res.status(500).json({ error: 'FAILED_TO_CALL_GEMINI', message: err.message });
  }
});

export default router;
