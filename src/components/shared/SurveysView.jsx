import React, { useState } from 'react';
import { FileText, PlusCircle, Check, HelpCircle, Calendar, Users, Eye, ArrowUpRight, X, AlertTriangle } from 'lucide-react';

/**
 * SurveysView Component
 * @description View component para sa pamamahala ng mga tracer surveys. Pinapayagan nito ang mga Admin
 * at Chairperson na gumawa ng mga bagong questionnaire at mag-inspect ng mga sagot,
 * habang pinapayagan ang mga alumni na sumagot sa mga aktibong tracer surveys.
 */
export default function SurveysView({ 
  surveys, 
  activeUser, 
  onSaveSurvey, 
  surveyResponses = [], 
  onSubmitResponse 
}) {
  // State hook para sa pagpapakita ng modal sa paggawa ng bagong survey
  const [isAddingSurvey, setIsAddingSurvey] = useState(false);
  // State hook para sa mensaheng ipapakita sa toast status alert
  const [showComment, setShowComment] = useState('');

  // Mga state para sa form ng paggawa ng bagong tracer survey
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [builderQuestions, setBuilderQuestions] = useState([
    { text: 'What is your current job designation?', type: 'text', options: '' }
  ]);

  // Mga state para sa pagsagot sa kasalukuyang survey ng alumni
  const [answeringSurvey, setAnsweringSurvey] = useState(null);
  const [currentAnswers, setCurrentAnswers] = useState({});

  // State para sa pagpapakita ng mga responses/submitted survey answers ng graduates
  const [viewingResponsesSurvey, setViewingResponsesSurvey] = useState(null);

  // Tinitingnan kung Administrator o Chairperson ang kasalukuyang user para sa permission checks
  const isAdminOrChair = activeUser.role === 'Administrator' || activeUser.role === 'Department Chairperson';

  /**
   * addBuilderQuestion
   * Nagdaragdag ng panibagong blankong tanong sa listahan ng ginagawang survey
   */
  const addBuilderQuestion = () => {
    setBuilderQuestions([...builderQuestions, { text: '', type: 'text', options: '' }]);
  };

  /**
   * removeBuilderQuestion
   * Nagtatanggal ng tanong sa listahan base sa kaukulang index nito
   */
  const removeBuilderQuestion = (index) => {
    if (builderQuestions.length <= 1) return;
    const updated = [...builderQuestions];
    updated.splice(index, 1);
    setBuilderQuestions(updated);
  };

  /**
   * updateBuilderQuestion
   * Binabago ang specific na field (tulad ng text o input type) ng isang tanong sa listahan
   */
  const updateBuilderQuestion = (index, field, value) => {
    const updated = [...builderQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setBuilderQuestions(updated);
  };

  /**
   * handleSubmit
   * Tagapamahala sa pagsusumite (deploy) ng bagong gawang tracer survey
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasyon para masiguro na kumpleto ang mga pangunahing detalye ng survey
    if (!title.trim() || !description.trim() || !startDate || !endDate) {
      alert('Please fill out all mandatory survey fields.');
      return;
    }

    // Pag-format ng mga tanong na inihanda sa survey builder
    const questionsArray = builderQuestions
      .filter(q => q.text.trim().length > 0)
      .map((q, idx) => ({
        id: `q-${idx + 1}`,
        text: q.text.trim(),
        type: q.type,
        options: q.type === 'select' ? q.options.split(',').map(o => o.trim()).filter(Boolean) : []
      }));

    // Pagbuo ng pinal na survey object
    const finalSurvey = {
      id: `survey-${Date.now()}`,
      title,
      description,
      startDate,
      endDate,
      status: 'Active',
      questions: questionsArray.length > 0 ? questionsArray : [
        { id: 'q-default', text: 'What is your current job designation?', type: 'text', options: [] }
      ],
      responsesCount: 0
    };

    // Pag-save ng survey gamit ang ibinigay na parent action callback
    await onSaveSurvey(finalSurvey);
    setIsAddingSurvey(false);
    setShowComment(`SUCCESS! Tracer Survey '${title}' has been deployed.`);
    setTimeout(() => setShowComment(''), 4000);

    // I-reset ang buong form matapos ang tagumpay na deployment
    setTitle('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setBuilderQuestions([
      { text: 'What is your current job designation?', type: 'text', options: '' }
    ]);
  };

  /**
   * handleAnsweringSubmit
   * Tagapamahala sa pagsusumite ng mga sagot ng alumni sa sinagutang survey
   */
  const handleAnsweringSubmit = async (e) => {
    e.preventDefault();
    if (!answeringSurvey || !onSubmitResponse) return;

    // Validasyon para masiguradong nasagutan ang lahat ng tanong sa listahan
    const unanswered = answeringSurvey.questions.filter(q => !currentAnswers[q.id]?.trim());
    if (unanswered.length > 0) {
      alert('Please fill out all questions before submitting.');
      return;
    }

    // Pagsusumite ng mga sagot sa parent context sa pamamagitan ng callback
    await onSubmitResponse(answeringSurvey.id, currentAnswers);
    setAnsweringSurvey(null);
    setCurrentAnswers({});
    setShowComment(`SUCCESS! Your responses strictly aligned under standard specifications have been compiled.`);
    setTimeout(() => setShowComment(''), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Toast notification notice para sa feedback messages */}
      {showComment && (
        <div id="survey-toast-alert" className="p-4 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="p-1 bg-[#1e4620] text-emerald-50 rounded-full"><Check className="w-3 h-3" /></span>
          {showComment}
        </div>
      )}

      {/* Intro Header ng surveys module */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider font-sans">Graduate Tracer Surveys</h2>
          <p className="text-[11px] text-slate-405 mt-0.5">
            {isAdminOrChair 
              ? 'Formulate, schedule and analyze graduate tracer questionnaires to track BSC program KPIs.' 
              : 'Participate in educational tracer studies to help audit and upgrade academic curriculums.'}
          </p>
        </div>

        {isAdminOrChair && (
          <button
            id="btn-create-tracer-form"
            onClick={() => setIsAddingSurvey(true)}
            className="px-4 py-2 bg-[#1e4620] hover:bg-emerald-950 text-white font-bold text-xs rounded-lg transition inline-flex items-center gap-1.5 uppercase shrink-0 font-sans cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Create Tracer Survey
          </button>
        )}
      </div>

      {/* Grid para sa mga aktibong survey */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {surveys.map((survey) => {
          // Tinitingnan kung ang kasalukuyang user ay isang Alumni at kung nasagutan na niya ito
          const responsesForThisSurvey = surveyResponses.filter(r => r.surveyId === survey.id);
          const hasAnswered = activeUser.role === 'Alumni' && responsesForThisSurvey.some(r => r.alumniId === activeUser.id);

          return (
            <div key={survey.id} className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="bg-emerald-100 text-[#1e4620] font-bold text-[9px] px-2 py-0.5 rounded-full uppercase border border-emerald-200">
                    {survey.status}
                  </span>
                  <span className="text-[10px] text-slate-404 font-mono select-all font-bold">Ref: {survey.id}</span>
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#1e4620]" /> {survey.title}
                  </h3>
                  <p className="text-xs text-slate-505 font-semibold mt-1.5 leading-relaxed">{survey.description}</p>
                </div>

                {/* Preview ng mga tanong na kasama sa survey */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block tracking-wider">Tracer Questions ({survey.questions.length}):</span>
                  <ul className="space-y-1">
                    {survey.questions.map((q, idx) => (
                      <li key={q.id} className="text-xs font-semibold text-slate-600 flex items-start gap-1">
                        <span className="text-amber-500 font-extrabold">{idx + 1}.</span>
                        <p>{q.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex flex-col space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" /> Deadline: {survey.endDate}
                  </span>
                  
                  {isAdminOrChair && (
                    <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                      {/* NOTE: Ginawa nating <= 1 para maging singular din ang 0 responses alinsunod sa bagong requirement ng user. */}
                      <Users className="w-4 h-4" /> {responsesForThisSurvey.length} {responsesForThisSurvey.length <= 1 ? 'Response' : 'Responses'}
                    </span>
                  )}
                </div>

                {/* Mga aksyon depende sa role ng user (Admin, Chairperson, o Alumni) */}
                <div className="flex gap-2">
                  {isAdminOrChair && (
                    <button
                      onClick={() => setViewingResponsesSurvey(survey)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-lg uppercase tracking-wider inline-flex justify-center items-center gap-1 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Submissions ({responsesForThisSurvey.length})
                    </button>
                  )}

                  {activeUser.role === 'Alumni' && (
                    hasAnswered ? (
                      <div className="w-full text-center py-2 bg-emerald-50 text-[#1e4620] font-extrabold text-xs rounded-lg uppercase border border-emerald-200 select-none">
                        ✓ Response Completed &amp; Filed
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setAnsweringSurvey(survey);
                          // I-initialize ang walang laman na answers state para sa bawat tanong
                          const initial = {};
                          survey.questions.forEach(q => { initial[q.id] = ''; });
                          setCurrentAnswers(initial);
                        }}
                        className="w-full py-2 bg-[#1e4620] hover:bg-emerald-950 text-white font-extrabold text-xs rounded-lg uppercase tracking-wider inline-flex justify-center items-center gap-1.5 transition cursor-pointer"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" /> Provide Tracer Answers
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* MODAL PARA SA PAGGAWA NG BAGONG TRACER SURVEY (PANG-ADMIN) */}
      {/* ========================================================== */}
      {isAddingSurvey && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in animate-duration-200">
          <div className="bg-white w-full max-w-lg h-[540px] shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-slate-100 relative">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1e4620]" />
                <h3 className="text-sm font-extrabold text-[#1e4620] uppercase tracking-wide">Configure Graduate Tracer Questionnaire</h3>
              </div>
              <button 
                onClick={() => setIsAddingSurvey(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-500 mb-1">Survey Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., BSC Graduate Employability Survey 2026"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 focus:ring-1 focus:ring-[#1e4620] font-sans"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Administrative Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide purpose description or alignment with CHED guidelines..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-semibold text-slate-650 font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <label className="text-slate-700 font-bold text-xs uppercase tracking-wider block">Tracer Questions ({builderQuestions.length}) *</label>
                    <button
                      type="button"
                      onClick={addBuilderQuestion}
                      className="px-2 py-1 bg-[#cca43b] hover:bg-[#cca43b]/90 text-slate-900 font-bold text-[10px] rounded flex items-center gap-1 transition cursor-pointer font-sans"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Add Question
                    </button>
                  </div>

                  <div className="space-y-3">
                    {builderQuestions.map((question, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 relative">
                        {builderQuestions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBuilderQuestion(idx)}
                            className="absolute top-2 right-2 p-1 hover:bg-slate-200 text-rose-600 rounded transition cursor-pointer"
                            title="Remove Question"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Question Text #{idx + 1}</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Current employment status?"
                              value={question.text}
                              onChange={(e) => updateBuilderQuestion(idx, 'text', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#7c191e] font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] text-slate-400 font-bold mb-0.5">Input Type</label>
                            <select
                              value={question.type}
                              onChange={(e) => updateBuilderQuestion(idx, 'type', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-bold text-slate-700 focus:outline-none font-sans"
                            >
                              <option value="text">Text Response</option>
                              <option value="select">Multiple Choice</option>
                            </select>
                          </div>
                        </div>

                        {question.type === 'select' && (
                          <div className="animate-fade-in space-y-1">
                            <label className="block text-[9px] text-slate-400 font-bold mb-0.5">Options (comma-separated list)</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Employed, Unemployed, Self-Employed"
                              value={question.options || ''}
                              onChange={(e) => updateBuilderQuestion(idx, 'options', e.target.value)}
                              className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#7c191e] font-sans"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </form>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 z-10 w-full font-sans">
              <button
                type="button"
                onClick={() => setIsAddingSurvey(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 bg-[#7c191e] hover:bg-[#7c191e]/90 text-white font-bold rounded-lg transition shadow cursor-pointer"
              >
                Deploy Survey Model
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL PARA SA INTERACTIVE NA PAGSAGOT NG ALUMNI SA QUESTIONNAIRE */}
      {/* ========================================================== */}
      {answeringSurvey && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in font-sans">
          <div className="bg-white w-full max-w-lg h-[480px] shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-slate-100 relative">
            
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#cca43b] animate-pulse" />
                <div>
                  <h3 className="text-sm font-extrabold text-[#7c191e] uppercase tracking-wide">Tracer Questionnaire Entry</h3>
                  <span className="block text-[10px] text-slate-400 font-bold">Please complete your alignment evaluation inputs accurately</span>
                </div>
              </div>
              <button 
                onClick={() => setAnsweringSurvey(null)}
                className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAnsweringSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-semibold">
              <div className="bg-amber-500/5 border border-amber-305/30 p-3.5 rounded-xl text-slate-600 flex gap-2 mb-2 leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>These responses are tabulated under strict CHED tracer parameters. Make sure your values reflect your true employment conditions.</p>
              </div>

              <div className="space-y-4 font-sans">
                {answeringSurvey.questions.map((question, qIdx) => (
                  <div key={question.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                    <label className="block text-slate-700 font-bold text-xs">
                      <span className="text-amber-600 font-extrabold mr-1">{qIdx + 1}.</span>
                      {question.text} *
                    </label>

                    {question.type === 'select' ? (
                      <select
                        required
                        value={currentAnswers[question.id] || ''}
                        onChange={(e) => setCurrentAnswers({
                          ...currentAnswers,
                          [question.id]: e.target.value
                        })}
                        className="w-full bg-white border border-slate-200 rounded-md p-2.5 focus:ring-1 focus:ring-[#7c191e] font-semibold text-slate-705 focus:outline-none font-sans"
                      >
                        <option value="">-- Choose Option --</option>
                        {question.options && question.options.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <textarea
                        required
                        rows={2}
                        value={currentAnswers[question.id] || ''}
                        onChange={(e) => setCurrentAnswers({
                          ...currentAnswers,
                          [question.id]: e.target.value
                        })}
                        placeholder="Provide answer in clear detail..."
                        className="w-full bg-white border border-slate-200 rounded-md p-2.5 focus:ring-1 focus:ring-[#7c191e] font-semibold text-slate-705 focus:outline-none font-sans"
                      />
                    )}
                  </div>
                ))}
              </div>
            </form>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-2 z-10 w-full font-sans">
              <button
                type="button"
                onClick={() => setAnsweringSurvey(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-705 font-bold rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAnsweringSubmit}
                className="px-4 py-2 bg-[#1e4620] hover:bg-emerald-950 text-white font-extrabold rounded-lg transition uppercase tracking-wider cursor-pointer"
              >
                Submit Survey Responses
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL PARA SA PAG-INSPECT NG MGA SUBMISSIONS NG ALUMNI (ADMIN/CHAIR) */}
      {/* ========================================================== */}
      {viewingResponsesSurvey && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in font-sans">
          <div className="bg-white w-full max-w-4xl h-[520px] shadow-2xl rounded-2xl overflow-hidden flex flex-col border border-slate-100 relative border-collapse">
            
            <div className="sticky top-0 bg-white border-b border-secondary/15 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-sm font-extrabold text-[#1e4620] uppercase tracking-wide">Tracer Study Submissions Feed</h3>
                  <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                    Viewing answers for &bull; {viewingResponsesSurvey.title}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setViewingResponsesSurvey(null)}
                className="p-1.5 hover:bg-slate-100 text-slate-505 rounded-lg transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 font-sans">
              {surveyResponses.filter(r => r.surveyId === viewingResponsesSurvey.id).length === 0 ? (
                <div className="py-24 text-center text-slate-400 space-y-2">
                  <FileText className="w-12 h-12 text-slate-200 mx-auto" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No Graduate responses recorded yet</p>
                  <p className="text-[11px] text-slate-400 font-semibold max-w-sm mx-auto">
                    Once alumni submit responses for this tracer questionnaire, they will show up inside this panel instantly.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-150 rounded-xl overflow-hidden bg-white shadow-xs">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-widest text-[9px]">
                        <th className="p-3 pl-4">Graduate Profile</th>
                        {viewingResponsesSurvey.questions.map(q => (
                          <th key={q.id} className="p-3 font-bold max-w-[200px] truncate" title={q.text}>
                            {q.text}
                          </th>
                        ))}
                        <th className="p-3 pr-4 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-605">
                      {surveyResponses
                        .filter(r => r.surveyId === viewingResponsesSurvey.id)
                        .map((resp, rIdx) => (
                          <tr key={resp.id || rIdx} className="hover:bg-slate-50/40">
                            <td className="p-3 pl-4 shrink-0">
                              <span className="block text-slate-800 font-extrabold">{resp.alumniName}</span>
                              <span className="block text-[8px] bg-amber-100 text-amber-800 font-mono px-1 py-0.2 rounded w-fit uppercase">
                                {resp.alumniId}
                              </span>
                            </td>
                            {viewingResponsesSurvey.questions.map(q => (
                              <td key={q.id} className="p-3 max-w-[220px] break-words text-slate-700 text-xs font-medium">
                                {resp.answers?.[q.id] || <span className="text-slate-300 font-semibold italic">Unspecified</span>}
                              </td>
                            ))}
                            <td className="p-3 pr-4 text-right font-semibold text-[10px] text-slate-400 whitespace-nowrap font-mono">
                              {new Date(resp.submittedAt).toLocaleDateString()} &bull; {new Date(resp.submittedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end z-10 w-full font-bold text-xs text-slate-450 select-none">
              <span>🔒 Only Batanes State College department administrators can audit response metrics.</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
