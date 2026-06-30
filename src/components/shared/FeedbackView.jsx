import React, { useState } from 'react';
import { HelpCircle, Star, MessageSquare, Check, Plus, ShieldCheck, Award, Eye, Building, GraduationCap, CornerDownRight, AlertCircle } from 'lucide-react';

export default function FeedbackView({ 
  feedbacks, 
  alumniList, 
  employers = [], 
  activeUser, 
  onSubmitFeedback 
}) {
  const [successMsg, setSuccessMsg] = useState('');

  // Mga state para sa form inputs
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Curriculum');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdminOrChair = activeUser.role === 'Administrator' || activeUser.role === 'Department Chairperson';
  const isEmployer = activeUser.role === 'Employer';
  const isAlumni = activeUser.role === 'Alumni';

  // Hinahanap ang pangalan ng kumpanya ng employer base sa activeUser.companyId o email matching
  const matchingEmployer = employers.find(e => 
    e.id === activeUser.companyId || 
    e.email?.toLowerCase() === activeUser.email?.toLowerCase() || 
    e.contactPerson?.toLowerCase() === activeUser.name?.toLowerCase()
  );

  const myCompanyName = matchingEmployer?.companyName || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      alert('Please fill out the feedback topic and core comments.');
      return;
    }

    setIsSubmitting(true);

    const submission = {
      id: `fb-${Date.now()}`,
      subject: subject.trim(),
      category,
      message: message.trim(),
      rating,
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
    setIsSubmitting(false);
  };

  // Sinasala ang mga feedback base sa role ng kasalukuyang user
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
    return false;
  });

  const averageRating = displayFeedbacks.length > 0 
    ? (displayFeedbacks.reduce((acc, current) => acc + (current.rating || 5), 0) / displayFeedbacks.length).toFixed(1)
    : '4.8';

  return (
    <div className="space-y-6 font-sans">
      
      {/* Popup ng Toast Notification */}
      {successMsg && (
        <div id="feedback-success-toast" className="p-4 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
          <span className="p-1 bg-[#1e4620] text-emerald-50 rounded-full"><Check className="w-3.5 h-3.5" /></span>
          {successMsg}
        </div>
      )}

      {/* Header ng Pagpapakilala (Intro Header) */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Curriculum Evaluation &amp; QA Feedback</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isAlumni 
              ? 'Evaluate Batanes State College (BSC) curriculum and suggest improvements based on your active career experiences.'
              : isEmployer
              ? 'Provide feedback regarding the skills, performance, and curriculum relevance of BSC graduates in your organization.'
              : 'Audit and inspect curriculum feedback submitted by graduates to adjust course syllabi.'}
          </p>
        </div>
        {(isAlumni || isEmployer) && (
          <div className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200">
            Role: <span className={isAlumni ? "text-[#1e4620]" : "text-[#7c191e]"}>{activeUser.role}</span>
          </div>
        )}
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
                  placeholder={isAlumni ? "e.g., IT Course Relevance to Web Development" : "e.g., Skills Competency of BSIT Graduates"}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:outline-none ${
                    isAlumni ? 'focus:ring-[#1e4620]' : 'focus:ring-[#7c191e]'
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

              <div>
                <label className="block text-slate-550 mb-1 font-bold">Rating for Program Curriculum Quality</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1 focus:outline-none transition-all cursor-pointer ${
                        rating >= star ? 'text-amber-500 scale-105' : 'text-slate-300'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
                <span className="text-[9px] text-slate-400 font-bold block mt-1">
                  {rating === 5 ? '⭐ Excellent: Graduate skills exceed industry standards.' : 
                   rating === 4 ? '⭐ Very Good: Skills learned align well with job roles.' :
                   rating === 3 ? '⭐ Good: Meets basic employment requirements.' :
                   rating === 2 ? '⭐ Fair: Needs improvement in modern frameworks/practices.' :
                   '★ Poor: Curriculum is severely outdated/needs overhaul.'}
                </span>
              </div>

              <div>
                <label className="block text-slate-550 mb-1 font-bold">Assessment Observations &amp; Suggestions *</label>
                <textarea
                  required
                  rows={4}
                  placeholder={
                    isAlumni 
                      ? "e.g., 'The Web Programming syllabus was useful, but adding modern frontend frameworks like React would align better with current jobs...'"
                      : "e.g., 'BSC graduates display strong foundational values, but they would benefit from practical exposure to modern cloud databases like Firebase or AWS...'"
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:outline-none text-slate-700 font-medium font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-2.5 text-white font-extrabold uppercase text-xs rounded-lg transition-all shadow-md inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  isAlumni ? 'bg-[#1e4620] hover:bg-[#112d12]' : 'bg-[#7c191e] hover:bg-[#581014]'
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
            <span className="block text-xs font-bold text-[#1e4620] uppercase tracking-wider">
              Feedback Metrics
            </span>
            
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center space-y-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Overall Curriculum Quality Score
              </span>
              <span className="text-2xl font-extrabold text-[#112d12]">{averageRating} / 5.0</span>
              <div className="flex justify-center text-amber-500 text-sm font-bold gap-1">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            </div>

            <div className="text-xs text-slate-500 leading-relaxed font-semibold space-y-2">
              <p>
                These responses are submitted by alumni graduates to assist department chairpersons in course syllabus audit and development.
              </p>
              <p className="p-2 bg-emerald-50 text-[#1e4620] rounded border border-emerald-100 text-[10px] font-bold">
                💡 High-rated dimensions indicate strong curricular alignment with modern industrial needs.
              </p>
            </div>
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

                  <p className="text-slate-600 font-medium text-xs leading-relaxed bg-white border border-slate-100 p-3 rounded-lg shadow-2xs font-sans">
                    {fb.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
