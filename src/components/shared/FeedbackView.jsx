import React, { useState } from 'react';
import { HelpCircle, Star, MessageSquare, Check, Plus, ShieldCheck, Award, Eye, Building, GraduationCap, CornerDownRight, AlertCircle, Sparkles, Brain, Cpu, Copy, CheckCheck, RefreshCw, X, Printer, Download, ChevronDown, FileSpreadsheet } from 'lucide-react';
import { aiSummarizeFeedback } from '../../services/api';
import { exportToPDF } from '../../utils/pdfExport';

export default function FeedbackView({
  feedbacks,
  alumniList,
  employers = [],
  activeUser,
  onSubmitFeedback
}) {
  const [successMsg, setSuccessMsg] = useState('');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Helper function para sa pag-export ng curriculum feedback patungong CSV
  const handleExportCSV = () => {
    let csvHeader = 'No.,Author,Role,Category,Subject,Message,Rating,Date\n';
    let csvContent = feedbacks.map((f, idx) => {
      const dateStr = new Date(f.submittedAt).toLocaleDateString();
      return `${idx + 1},"${f.authorName}","${f.authorRole}","${f.category}","${f.subject}","${f.message.replace(/"/g, '""')}","${f.rating || ''}","${dateStr}"`;
    }).join('\n');

    const blob = new Blob([csvHeader + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BSC_Curriculum_Feedback_Report_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // AI Feedback Summary States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');
  const [aiError, setAiError] = useState('');
  const [aiCopied, setAiCopied] = useState(false);

  const handleGenerateAiFeedbackSummary = async () => {
    if (!feedbacks || feedbacks.length === 0) return;
    setAiLoading(true);
    setAiError('');
    setAiResult('');
    try {
      const token = sessionStorage.getItem('careerpath_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };
      const data = await aiSummarizeFeedback(feedbacks, headers);
      if (data.success) {
        setAiResult(data.summary);
      } else {
        setAiError(data.message || 'Failed to analyze feedback.');
      }
    } catch (err) {
      console.error(err);
      setAiError(err.message || 'Failed to connect to AI server.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult);
    setAiCopied(true);
    setTimeout(() => setAiCopied(false), 2000);
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith('### ')) {
        return <h4 key={idx} className="text-[11.5px] font-extrabold text-slate-800 uppercase tracking-wide mt-4 mb-2 flex items-center gap-1.5"><Brain className="w-3.5 h-3.5 text-[#1e4620]" /> {cleanLine.replace('### ', '')}</h4>;
      }
      if (cleanLine.startsWith('## ')) {
        return <h3 key={idx} className="text-xs font-extrabold text-[#1e4620] uppercase mt-5 mb-3 border-b border-slate-200 pb-1.5 flex items-center gap-2"><Cpu className="w-4 h-4 text-[#7c191e]" /> {cleanLine.replace('## ', '')}</h3>;
      }
      if (cleanLine.startsWith('# ')) {
        return <h2 key={idx} className="text-sm font-black text-[#7c191e] mt-6 mb-3 flex items-center gap-2 border-b-2 border-[#7c191e]/20 pb-2">{cleanLine.replace('# ', '')}</h2>;
      }
      if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
        const parts = cleanLine.substring(2).split('**');
        const formatted = parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold text-slate-900 bg-amber-50 px-0.5 rounded">{p}</strong> : p);
        return <li key={idx} className="text-[11px] text-slate-655 ml-5 list-disc mb-1.5 leading-relaxed">{formatted}</li>;
      }
      if (cleanLine === '') {
        return <div key={idx} className="h-2.5" />;
      }
      const parts = cleanLine.split('**');
      const formatted = parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="font-extrabold text-slate-900 bg-amber-50 px-0.5 rounded">{p}</strong> : p);
      return <p key={idx} className="text-[11px] text-slate-600 leading-relaxed mb-2.5">{formatted}</p>;
    });
  };

  // Mga state para sa form inputs
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Curriculum');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Structured Employer Evaluation States
  const [ratingTechnical, setRatingTechnical] = useState(5);
  const [ratingCommunication, setRatingCommunication] = useState(5);
  const [ratingProblemSolving, setRatingProblemSolving] = useState(5);
  const [ratingWorkEthics, setRatingWorkEthics] = useState(5);
  const [ratingTeamwork, setRatingTeamwork] = useState(5);
  const [strengths, setStrengths] = useState('');
  const [suggestions, setSuggestions] = useState('');

  const isAdminOrChair = activeUser.role === 'Administrator' || activeUser.role === 'Super Admin' || activeUser.role === 'Department Chairperson';
  const isEmployer = activeUser.role === 'Employer';
  const isAlumni = activeUser.role === 'Alumni';

  // Hinahanap ang pangalan ng kumpanya ng employer base sa activeUser.companyId o email matching
  const matchingEmployer = employers.find(e =>
    e.id === activeUser.companyId ||
    e.email?.toLowerCase() === activeUser.email?.toLowerCase() ||
    e.contactPerson?.toLowerCase() === activeUser.name?.toLowerCase()
  );

  const myCompanyName = matchingEmployer?.companyName || '';

  const getCategoryDetails = () => {
    switch (category) {
      case 'Curriculum':
        return {
          subjectPlaceholder: isAlumni ? "e.g., IT Course Relevance to Web Development" : "e.g., Skills Competency of BSIT Graduates",
          ratingLabel: 'Rating for Program Curriculum Quality',
          starLabels: {
            5: '⭐ Excellent: Graduate skills exceed industry standards.',
            4: '⭐ Very Good: Skills learned align well with job roles.',
            3: '⭐ Good: Meets basic employment requirements.',
            2: '⭐ Fair: Needs improvement in modern frameworks/practices.',
            1: '★ Poor: Curriculum is severely outdated/needs overhaul.'
          },
          messageLabel: 'Assessment Observations & Suggestions *',
          placeholder: isAlumni
            ? "e.g., 'The Web Programming syllabus was useful, but adding modern frontend frameworks like React would align better with current jobs...'"
            : "e.g., 'Graduates have good database fundamentals, but need more training in modern frontend frameworks...'"
        };
      case 'Employability':
        return {
          subjectPlaceholder: 'e.g., Job Placement Assistance Feedback',
          ratingLabel: 'Rating for Employability & Placement Support',
          starLabels: {
            5: '⭐ Excellent: Career opportunities are abundant and active.',
            4: '⭐ Very Good: Good industry linkages and job notifications.',
            3: '⭐ Good: Adequate listings and basic career assistance.',
            2: '⭐ Fair: Limited job listings and slow career matching.',
            1: '★ Poor: Lack of active placement support and career guidelines.'
          },
          messageLabel: 'Employability & Job Assistance Comments *',
          placeholder: "e.g., 'More local internship partnerships and job fairs would help speed up alumni employment...'"
        };
      case 'System':
        return {
          subjectPlaceholder: 'e.g., Alumni Tracer Login & Registration Issues',
          ratingLabel: 'Rating for Grad Tracer Portal System',
          starLabels: {
            5: '⭐ Excellent: Application interface is extremely fast, clear, and modern.',
            4: '⭐ Very Good: Standard features work well with good response times.',
            3: '⭐ Good: Functional portal, but some pages load slowly.',
            2: '⭐ Fair: Navigation is confusing or has minor glitches.',
            1: '★ Poor: Many features are broken, or page loads are very slow.'
          },
          messageLabel: 'System Feedback & Bug Reports *',
          placeholder: "e.g., 'The registration form keeps lagging when uploading images. Please optimize file uploads...'"
        };
      case 'Others':
      default:
        return {
          subjectPlaceholder: 'e.g., Suggestions for General BSC Services',
          ratingLabel: 'Overall Rating for General Services',
          starLabels: {
            5: '⭐ Excellent: Completely satisfied with general support and facilities.',
            4: '⭐ Very Good: Mostly satisfied with timely assistance.',
            3: '⭐ Good: Neutral experience with acceptable resolution.',
            2: '⭐ Fair: Below average support, needs significant improvements.',
            1: '★ Poor: Extremely unsatisfied with other services or procedures.'
          },
          messageLabel: 'General Inquiries & Other Comments *',
          placeholder: "e.g., 'Please consider improving library digital access or processing of alumni records...'"
        };
    }
  };

  const details = getCategoryDetails();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      alert('Please fill out the feedback topic.');
      return;
    }
    const isCurriculumEvaluation = isEmployer && category === 'Curriculum';
    if (!isCurriculumEvaluation && !message.trim()) {
      alert('Please fill out the core comments.');
      return;
    }
    if (isCurriculumEvaluation && (!strengths.trim() || !suggestions.trim())) {
      alert('Please fill out the graduate strengths and recommended syllabus changes.');
      return;
    }

    setIsSubmitting(true);

    let finalMessage = message.trim();
    let finalRating = rating;

    if (isCurriculumEvaluation) {
      const evaluationData = {
        type: 'Evaluation',
        ratings: {
          technical: ratingTechnical,
          communication: ratingCommunication,
          problemSolving: ratingProblemSolving,
          workEthics: ratingWorkEthics,
          teamwork: ratingTeamwork
        },
        strengths: strengths.trim(),
        suggestions: suggestions.trim()
      };
      finalMessage = JSON.stringify(evaluationData);
      finalRating = Math.round((ratingTechnical + ratingCommunication + ratingProblemSolving + ratingWorkEthics + ratingTeamwork) / 5);
    }

    const submission = {
      id: `fb-${Date.now()}`,
      subject: subject.trim(),
      category,
      message: finalMessage,
      rating: finalRating,
      submittedBy: activeUser.name,
      submittedAt: new Date().toISOString(),
      alumniStudentId: isAlumni ? activeUser.id : undefined,
      alumniName: isAlumni ? activeUser.name : undefined,
      companyName: isEmployer ? (myCompanyName || 'Partner Enterprise') : undefined
    };

    await onSubmitFeedback(submission);
    setSuccessMsg('SUCCESS! Your curriculum feedback has been submitted. Thank you for helping Batanes State College improve its programs.');
    setTimeout(() => setSuccessMsg(''), 5000);

    // I-reset ang Form
    setSubject('');
    setCategory('Curriculum');
    setMessage('');
    setRating(5);
    setRatingTechnical(5);
    setRatingCommunication(5);
    setRatingProblemSolving(5);
    setRatingWorkEthics(5);
    setRatingTeamwork(5);
    setStrengths('');
    setSuggestions('');
    setIsSubmitting(false);
  };

  // Fina-filter ang mga feedback base sa role ng kasalukuyang user
  const feedbackList = feedbacks || [];
  const displayFeedbacks = feedbackList.filter(fb => {
    if (isAdminOrChair) return true;
    if (isAlumni) {
      return fb.alumniStudentId === activeUser.id;
    }
    if (isEmployer) {
      const fbCompany = (fb.companyName || '').trim().toLowerCase();
      const myComp = myCompanyName.toLowerCase().trim();
      return (myComp && fbCompany === myComp) || fb.submittedBy?.toLowerCase().includes(activeUser.name.toLowerCase());
    }
  });

  // Parse structured employer evaluations for dashboard metrics
  const evaluations = displayFeedbacks.map(fb => {
    if (fb.message && fb.message.startsWith('{"type":"Evaluation"')) {
      try {
        return { ...fb, evalData: JSON.parse(fb.message) };
      } catch (e) { }
    }
    return null;
  }).filter(Boolean);

  const totalEvals = evaluations.length;
  const avgTech = totalEvals > 0 ? (evaluations.reduce((acc, ev) => acc + (ev.evalData.ratings?.technical || 5), 0) / totalEvals).toFixed(1) : '0.0';
  const avgComm = totalEvals > 0 ? (evaluations.reduce((acc, ev) => acc + (ev.evalData.ratings?.communication || 5), 0) / totalEvals).toFixed(1) : '0.0';
  const avgProb = totalEvals > 0 ? (evaluations.reduce((acc, ev) => acc + (ev.evalData.ratings?.problemSolving || 5), 0) / totalEvals).toFixed(1) : '0.0';
  const avgEth = totalEvals > 0 ? (evaluations.reduce((acc, ev) => acc + (ev.evalData.ratings?.workEthics || 5), 0) / totalEvals).toFixed(1) : '0.0';
  const avgTeam = totalEvals > 0 ? (evaluations.reduce((acc, ev) => acc + (ev.evalData.ratings?.teamwork || 5), 0) / totalEvals).toFixed(1) : '0.0';

  // Kinakalkula ang average rating ng feedbacks; ibinabalik ang 'N/A' kapag wala pang naitalang feedback records
  const averageRating = displayFeedbacks.length > 0
    ? (displayFeedbacks.reduce((acc, current) => acc + (current.rating || 5), 0) / displayFeedbacks.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-6 font-sans">

      {/* Popup ng Toast Notification */}
      {successMsg && (
        <div id="feedback-success-toast" className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <span className="p-1 bg-[#1e4620] text-emerald-50 rounded-full"><Check className="w-3.5 h-3.5" /></span>
          {successMsg}
        </div>
      )}

      {/* Header ng Pagpapakilala (Intro Header) */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Curriculum Evaluation &amp; QA Feedback</h2>
          <p className="text-[11px] text-slate-405 mt-0.5">
            {isAlumni
              ? 'Evaluate Batanes State College (BSC) curriculum and suggest improvements based on your active career experiences.'
              : isEmployer
                ? 'Provide feedback regarding the skills, performance, and curriculum relevance of BSC graduates in your organization.'
                : 'Audit and inspect curriculum feedback submitted by graduates to adjust course syllabi.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 no-print shrink-0 w-full sm:w-auto">
          {/* Print button */}
          <button
            onClick={() => window.print()}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-[11px] rounded-full transition inline-flex items-center gap-1.5 uppercase cursor-pointer shadow-3xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#7c191e]" /> Print
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="px-3.5 py-1.5 bg-[#7c191e] hover:bg-[#7c191e]/90 text-white font-extrabold text-[11px] rounded-full transition inline-flex items-center gap-1.5 uppercase shadow-3xs cursor-pointer select-none"
            >
              <Download className="w-3.5 h-3.5" /> Export <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${exportDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {exportDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setExportDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-lg shadow-lg z-20 py-1 animate-fade-in text-slate-750 text-xs font-extrabold font-sans">
                  <button
                    onClick={() => {
                      setExportDropdownOpen(false);
                      handleExportCSV();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer text-slate-700 text-xs font-bold"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export as CSV
                  </button>

                  <button
                    onClick={() => {
                      setExportDropdownOpen(false);
                      exportToPDF('main-content-stage', 'BSC_Curriculum_QA_Feedback_Report.pdf');
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 transition cursor-pointer text-slate-700 text-xs font-bold"
                  >
                    <FileText className="w-4 h-4 text-rose-600" /> Export as PDF
                  </button>
                </div>
              </>
            )}
          </div>
          {(isAlumni || isEmployer) && (
            <div className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
              Role: <span className={isAlumni ? "text-[#1e4620]" : "text-[#7c191e]"}>{activeUser.role}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ========================================================== */}
        {/* FORM SECTION (PARA SA ALUMNI AT EMPLOYERS)                 */}
        {/* ========================================================== */}
        {(isAlumni || isEmployer) && (
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 space-y-4 h-fit">
            <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
              <MessageSquare className={`w-5 h-5 ${isAlumni ? 'text-[#1e4620]' : 'text-[#7c191e]'}`} />
              <div>
                <h3 className={`text-xs font-extrabold ${isAlumni ? 'text-[#1e4620]' : 'text-[#7c191e]'} uppercase tracking-wider`}>
                  {isAlumni ? 'Submit Curriculum Feedback' : 'Submit Employer Evaluation'}
                </h3>
                <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                  {isAlumni
                    ? 'Help improve course alignment with current industry needs'
                    : 'Evaluate graduate capabilities and suggest curriculum enhancements'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 leading-relaxed text-xs font-semibold text-slate-600">
              <div>
                <label className="block text-slate-550 mb-1 font-bold">Feedback Subject / Topic *</label>
                <input
                  type="text"
                  required
                  placeholder={details.subjectPlaceholder}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:outline-none ${isAlumni ? 'focus:ring-[#1e4620]' : 'focus:ring-[#7c191e]'
                    }`}
                />
              </div>

              <div>
                <label className="block text-slate-550 mb-1 font-bold">Feedback Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold cursor-pointer focus:outline-none"
                >
                  <option value="Curriculum">Curriculum / Syllabus Relevance</option>
                  <option value="Employability">Employability &amp; Placement Support</option>
                  <option value="System">Grad Tracer Portal System</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {isEmployer && category === 'Curriculum' ? (
                // Structured Employer Questionnaire
                <div className="space-y-4">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Graduate Performance Ratings</span>

                  {/* Technical & Job Skills */}
                  <div>
                    <label className="block text-slate-550 mb-1 font-bold">1. Technical &amp; Practical Skills (e.g. coding, operations)</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingTechnical(star)}
                          className={`p-0.5 focus:outline-none transition-all cursor-pointer ${ratingTechnical >= star ? 'text-amber-500 scale-105' : 'text-slate-300'
                            }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Communication Skills */}
                  <div>
                    <label className="block text-slate-550 mb-1 font-bold">2. Communication &amp; English Proficiency</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingCommunication(star)}
                          className={`p-0.5 focus:outline-none transition-all cursor-pointer ${ratingCommunication >= star ? 'text-amber-500 scale-105' : 'text-slate-300'
                            }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Critical Thinking */}
                  <div>
                    <label className="block text-slate-550 mb-1 font-bold">3. Problem Solving &amp; Adaptability</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingProblemSolving(star)}
                          className={`p-0.5 focus:outline-none transition-all cursor-pointer ${ratingProblemSolving >= star ? 'text-amber-500 scale-105' : 'text-slate-300'
                            }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Work Ethics */}
                  <div>
                    <label className="block text-slate-550 mb-1 font-bold">4. Work Ethics, Values &amp; Integrity</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingWorkEthics(star)}
                          className={`p-0.5 focus:outline-none transition-all cursor-pointer ${ratingWorkEthics >= star ? 'text-amber-500 scale-105' : 'text-slate-300'
                            }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Teamwork */}
                  <div>
                    <label className="block text-slate-550 mb-1 font-bold">5. Teamwork, Coordination &amp; Synergy</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRatingTeamwork(star)}
                          className={`p-0.5 focus:outline-none transition-all cursor-pointer ${ratingTeamwork >= star ? 'text-amber-500 scale-105' : 'text-slate-300'
                            }`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-4">
                    <div>
                      <label className="block text-slate-550 mb-1 font-bold">Core Strengths of BSC Graduates *</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="What specific skills or qualities stand out most?"
                        value={strengths}
                        onChange={(e) => setStrengths(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:outline-none text-slate-700 font-medium font-sans"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-550 mb-1 font-bold">Recommended Syllabus &amp; Curriculum Changes *</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="What technologies or topics should we add to our curriculum?"
                        value={suggestions}
                        onChange={(e) => setSuggestions(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:outline-none text-slate-700 font-medium font-sans"
                      />
                    </div>
                  </div>

                </div>
              ) : (
                // Standard single rating form (for Alumni, and for Employer if category is not Curriculum)
                <>
                  <div>
                    <label className="block text-slate-550 mb-1 font-bold">{details.ratingLabel}</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`p-1 focus:outline-none transition-all cursor-pointer ${rating >= star ? 'text-amber-500 scale-105' : 'text-slate-300'
                            }`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold block mt-1">
                      {details.starLabels[rating]}
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-550 mb-1 font-bold">{details.messageLabel}</label>
                    <textarea
                      required
                      rows={4}
                      placeholder={details.placeholder}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:outline-none text-slate-700 font-medium font-sans ${isAlumni ? 'focus:ring-[#1e4620]' : 'focus:ring-[#7c191e]'
                        }`}
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 text-white font-extrabold uppercase text-xs rounded-lg transition-all shadow-md inline-flex items-center justify-center gap-1.5 cursor-pointer ${isAlumni ? 'bg-[#1e4620] hover:bg-[#112d12]' : 'bg-[#7c191e] hover:bg-[#581014]'
                  }`}
              >
                <Check className="w-4 h-4" /> Submit Feedback
              </button>
            </form>
          </div>
        )}

        {/* ========================================================== */}
        {/* STATS SECTION (PARA SA ADMINS / READ-ONLY OVERVIEWS)       */}
        {/* ========================================================== */}
        {isAdminOrChair && (
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 space-y-4 h-fit font-sans">
            <span className="block text-xs font-bold text-[#7c191e] uppercase tracking-wider">
              Employer Evaluation QA Dashboard
            </span>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Overall Quality Rating
              </span>
              <span className="text-2xl font-extrabold text-[#7c191e]">
                {averageRating} {averageRating !== 'N/A' ? '/ 5.0' : ''}
              </span>
              {averageRating !== 'N/A' && (
                <div className="flex justify-center text-amber-500 text-sm font-bold gap-1">
                  {Array.from({ length: Math.round(parseFloat(averageRating)) || 0 }).map((_, i) => (
                    <span key={i}>&#9733;</span>
                  ))}
                </div>
              )}
              <span className="text-[9px] text-slate-400 font-bold block mt-1">Based on {totalEvals} Employer evaluation{totalEvals <= 1 ? '' : 's'}</span>
            </div>

            {totalEvals > 0 ? (
              <div className="space-y-3 pt-2">
                <span className="block text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Graduate Competency Scores</span>

                {/* Technical Skills */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-655">
                    <span>Technical &amp; Job Skills</span>
                    <span className="text-slate-800 font-extrabold">{avgTech} / 5.0</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(parseFloat(avgTech) / 5) * 100}%` }} />
                  </div>
                </div>

                {/* Communication Skills */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-655">
                    <span>Communication Skills</span>
                    <span className="text-slate-800 font-extrabold">{avgComm} / 5.0</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(parseFloat(avgComm) / 5) * 100}%` }} />
                  </div>
                </div>

                {/* Problem Solving */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-655">
                    <span>Problem Solving</span>
                    <span className="text-slate-800 font-extrabold">{avgProb} / 5.0</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(parseFloat(avgProb) / 5) * 100}%` }} />
                  </div>
                </div>

                {/* Work Ethics */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-655">
                    <span>Work Ethics &amp; Values</span>
                    <span className="text-slate-800 font-extrabold">{avgEth} / 5.0</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(parseFloat(avgEth) / 5) * 100}%` }} />
                  </div>
                </div>

                {/* Teamwork */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-655">
                    <span>Teamwork &amp; Collaboration</span>
                    <span className="text-slate-800 font-extrabold">{avgTeam} / 5.0</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(parseFloat(avgTeam) / 5) * 100}%` }} />
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-[10px] text-slate-500 leading-relaxed font-semibold space-y-2">
                <p>
                  These responses are submitted by alumni graduates and employers to assist department chairpersons in course syllabus audit and development.
                </p>
                <p className="p-2 bg-emerald-50 text-[#1e4620] rounded border border-emerald-100 text-[10px] font-bold">
                  💡 When structured evaluations are submitted by partner companies, average performance categories will automatically render here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* NEW: AI CURRICULUM INSIGHTS SUMMARY (CHAIRPERSONS / ADMINS) */}
        {/* ========================================================== */}
        {isAdminOrChair && (
          <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 space-y-4 h-fit font-sans text-left">
            <span className="block text-xs font-bold text-[#7c191e] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              AI Curriculum Insights &amp; Sentiment
            </span>
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              Generate a synthesized SWOT analysis and curriculum improvement recommendation based on all employer feedback and performance ratings.
            </p>

            <button
              onClick={handleGenerateAiFeedbackSummary}
              disabled={aiLoading || feedbacks.length === 0}
              className="w-full py-2 bg-gradient-to-r from-[#7c191e] to-rose-700 hover:from-[#7c191e]/90 hover:to-rose-800 disabled:opacity-50 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer border-0 select-none"
            >
              {aiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generate AI SWOT Report
            </button>

            {aiLoading && !aiResult && (
              <div className="text-center py-6 space-y-2">
                <RefreshCw className="w-6 h-6 text-rose-700 animate-spin mx-auto" />
                <p className="text-[10px] text-slate-400 font-semibold animate-pulse">Analyzing comments, ratings, and feedback logs...</p>
              </div>
            )}

            {aiError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-800 text-[10.5px] font-semibold leading-relaxed">
                {aiError}
              </div>
            )}

            {aiResult && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 relative">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="text-[9px] font-black text-[#7c191e] uppercase">AI Generated Report</span>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyText}
                      className="text-[9px] text-slate-500 hover:text-slate-800 flex items-center gap-1 border-0 bg-transparent cursor-pointer font-bold uppercase font-sans"
                    >
                      {aiCopied ? <CheckCheck className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      {aiCopied ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => setAiResult('')}
                      className="text-[9px] text-slate-400 hover:text-slate-600 border-0 bg-transparent cursor-pointer font-bold uppercase font-sans"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto pr-1 text-left select-text">
                  {renderMarkdown(aiResult)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* FEEDBACK LIST VIEW (SHARED)                                 */}
        {/* ========================================================== */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-xs border border-slate-100 p-6 space-y-5 font-sans">
          <div className="flex justify-between items-center border-b border-slate-50 pb-2">
            <span className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              {isAdminOrChair
                ? 'All Curriculum Feedback Records'
                : 'My Submitted Feedback History'}
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold uppercase">
              {/* NOTE: Ginawa nating <= 1 para maging singular din ang 0 records alinsunod sa bagong requirement ng user. */}
              {displayFeedbacks.length} {displayFeedbacks.length <= 1 ? 'record' : 'records'} found
            </span>
          </div>

          {displayFeedbacks.length === 0 ? (
            <div className="py-20 text-center text-xs text-slate-400 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-200 mx-auto animate-bounce" />
              <p className="font-bold text-slate-500 uppercase tracking-widest leading-none">No active feedback logs</p>
              <p className="text-[10px] text-slate-400 font-semibold max-w-xs mx-auto">
                Once feedback has been submitted, reviews will automatically display here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {displayFeedbacks.map((fb) => (
                <div key={fb.id} className="py-4 space-y-3.5 animate-fade-in text-xs font-semibold text-slate-600">

                  {/* Detalye ng Koneksyon: TARGET ALUMNUS O NAGSUBMIT NA KUMPANYA */}
                  <div className="p-3 bg-slate-55 border border-slate-105 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase text-slate-400 font-extrabold block">Feedback Source</span>
                      <div className="flex items-center gap-1.5">
                        {fb.companyName ? (
                          <>
                            <Building className="w-4 h-4 text-[#7c191e]" />
                            <span className="text-xs font-extrabold text-slate-800">
                              {fb.submittedBy} ({fb.companyName})
                            </span>
                            <span className="text-[9px] bg-[#7c191e]/10 text-[#7c191e] px-1 py-0.2 rounded font-mono font-bold">
                              Employer
                            </span>
                          </>
                        ) : (
                          <>
                            <GraduationCap className="w-4 h-4 text-[#1e4620]" />
                            <span className="text-xs font-extrabold text-slate-800">
                              {fb.submittedBy} (Alumnus)
                            </span>
                            {fb.alumniStudentId && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono font-bold">
                                ID: {fb.alumniStudentId}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1 text-right sm:text-right text-left font-sans">
                      <span className="text-[9px] uppercase text-slate-400 font-extrabold block">Date Evaluated</span>
                      <span className="text-xs text-slate-500 font-bold">{new Date(fb.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-slate-800 text-xs text-emerald-950">
                          {fb.subject}
                        </span>
                        <span className="text-[10px] bg-emerald-50 border border-emerald-100 text-[#1e4620] px-1.5 py-0.2 rounded w-fit uppercase font-mono font-bold mt-1">
                          {fb.category || 'Curriculum'}
                        </span>
                      </div>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center text-amber-500 text-xs mt-0.5 shrink-0">
                      {Array.from({ length: Math.min(5, fb.rating || 5) }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500 shrink-0" />
                      ))}
                    </div>
                  </div>

                  {(() => {
                    let isEv = false;
                    let evD = null;
                    if (fb.message && fb.message.startsWith('{"type":"Evaluation"')) {
                      try {
                        evD = JSON.parse(fb.message);
                        isEv = true;
                      } catch (e) { }
                    }

                    if (isEv && evD) {
                      return (
                        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-3.5 shadow-2xs font-sans">
                          {/* Structured Scores */}
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-1">
                            <div className="p-2 bg-white rounded-lg border border-slate-100 text-center">
                              <span className="text-[9px] text-slate-400 font-extrabold block uppercase">Technical</span>
                              <span className="text-xs font-black text-slate-700">{evD.ratings?.technical || 5}.0 / 5</span>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-slate-100 text-center">
                              <span className="text-[9px] text-slate-400 font-extrabold block uppercase">Comm</span>
                              <span className="text-xs font-black text-slate-700">{evD.ratings?.communication || 5}.0 / 5</span>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-slate-100 text-center">
                              <span className="text-[9px] text-slate-400 font-extrabold block uppercase">Problem</span>
                              <span className="text-xs font-black text-slate-700">{evD.ratings?.problemSolving || 5}.0 / 5</span>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-slate-100 text-center">
                              <span className="text-[9px] text-slate-400 font-extrabold block uppercase">Ethics</span>
                              <span className="text-xs font-black text-slate-700">{evD.ratings?.workEthics || 5}.0 / 5</span>
                            </div>
                            <div className="p-2 bg-white rounded-lg border border-slate-100 text-center">
                              <span className="text-[9px] text-slate-400 font-extrabold block uppercase">Teamwork</span>
                              <span className="text-xs font-black text-slate-700">{evD.ratings?.teamwork || 5}.0 / 5</span>
                            </div>
                          </div>

                          {/* Strengths */}
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-extrabold text-[#7c191e] uppercase tracking-wider block">Graduate Core Strengths</span>
                            <p className="text-xs text-slate-650 font-medium leading-relaxed font-sans">{evD.strengths}</p>
                          </div>

                          {/* Suggestions */}
                          <div className="space-y-0.5">
                            <span className="text-[9px] font-extrabold text-[#cca43b] uppercase tracking-wider block">Recommended Syllabus Changes</span>
                            <p className="text-xs text-slate-650 font-medium leading-relaxed font-sans">{evD.suggestions}</p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <p className="text-slate-600 font-medium text-xs leading-relaxed bg-white border border-slate-100 p-3 rounded-lg shadow-2xs font-sans">
                        {fb.message}
                      </p>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
