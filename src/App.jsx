/**
 * @file App.jsx
 * @description Core client-side React component ng BSC CareerPath Tracer.
 * Ito ang nagsisilbing pangunahing router at view switcher. Pinapamahalaan nito ang mga layout tulad ng
 * Header, Sidebar, MobileMenu, at tinatakda kung anong functional sub-view ang ipapakita base sa active tab.
 */

import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

function applyAccentTheme(themeName) {
  let css = '';
  
  if (themeName === 'BSC Forest Green') {
    css = `
      .bg-\\[\\#1e4620\\] { background-color: #1e4620 !important; }
      .text-\\[\\#1e4620\\] { color: #1e4620 !important; }
      .border-\\[\\#1e4620\\] { border-color: #1e4620 !important; }
      .fill-\\[\\#1e4620\\] { fill: #1e4620 !important; }
      .stroke-\\[\\#1e4620\\] { stroke: #1e4620 !important; }
      .hover\\:text-\\[\\#1e4620\\]:hover { color: #1e4620 !important; }
      .hover\\:bg-\\[\\#1e4620\\]\\/10:hover { background-color: rgba(30, 70, 32, 0.1) !important; }
      .bg-\\[\\#1e4620\\]\\/5 { background-color: rgba(30, 70, 32, 0.05) !important; }
      .border-\\[\\#1e4620\\]\\/15 { border-color: rgba(30, 70, 32, 0.15) !important; }
      .bg-\\[\\#123d16\\] { background-color: #123d16 !important; }
      aside { background-image: linear-gradient(to bottom, #123d16, #0c2b0f) !important; border-right-color: #0c2b0f !important; }
      .border-\\[\\#0d2e10\\] { border-color: #0c2b0f !important; }
    `;
  } else if (themeName === 'Ocean Teal') {
    css = `
      .bg-\\[\\#1e4620\\] { background-color: #0d9488 !important; }
      .text-\\[\\#1e4620\\] { color: #0d9488 !important; }
      .border-\\[\\#1e4620\\] { border-color: #0d9488 !important; }
      .fill-\\[\\#1e4620\\] { fill: #0d9488 !important; }
      .stroke-\\[\\#1e4620\\] { stroke: #0d9488 !important; }
      .hover\\:text-\\[\\#1e4620\\]:hover { color: #0d9488 !important; }
      .hover\\:bg-\\[\\#1e4620\\]\\/10:hover { background-color: rgba(13, 148, 136, 0.1) !important; }
      .bg-\\[\\#1e4620\\]\\/5 { background-color: rgba(13, 148, 136, 0.05) !important; }
      .border-\\[\\#1e4620\\]\\/15 { border-color: rgba(13, 148, 136, 0.15) !important; }
      .bg-\\[\\#123d16\\] { background-color: #115e59 !important; }
      aside { background-image: linear-gradient(to bottom, #115e59, #134e4a) !important; border-right-color: #134e4a !important; }
      .border-\\[\\#0d2e10\\] { border-color: #134e4a !important; }
    `;
  } else if (themeName === 'Slate Steel') {
    css = `
      .bg-\\[\\#1e4620\\] { background-color: #475569 !important; }
      .text-\\[\\#1e4620\\] { color: #475569 !important; }
      .border-\\[\\#1e4620\\] { border-color: #475569 !important; }
      .fill-\\[\\#1e4620\\] { fill: #475569 !important; }
      .stroke-\\[\\#1e4620\\] { stroke: #475569 !important; }
      .hover\\:text-\\[\\#1e4620\\]:hover { color: #475569 !important; }
      .hover\\:bg-\\[\\#1e4620\\]\\/10:hover { background-color: rgba(71, 85, 105, 0.1) !important; }
      .bg-\\[\\#1e4620\\]\\/5 { background-color: rgba(71, 85, 105, 0.05) !important; }
      .border-\\[\\#1e4620\\]\\/15 { border-color: rgba(71, 85, 105, 0.15) !important; }
      .bg-\\[\\#123d16\\] { background-color: #334155 !important; }
      aside { background-image: linear-gradient(to bottom, #334155, #1e293b) !important; border-right-color: #1e293b !important; }
      .border-\\[\\#0d2e10\\] { border-color: #1e293b !important; }
    `;
  }

  // Compact Sidebar check in css injection
  const compact = localStorage.getItem('careerpath_compact_sidebar') === 'true';
  if (compact) {
    css += `
      @media (min-width: 768px) {
        body.compact-sidebar aside { width: 4.5rem !important; }
        body.compact-sidebar aside nav button { justify-content: center !important; padding-left: 0 !important; padding-right: 0 !important; }
        body.compact-sidebar aside nav button span { display: none !important; }
        body.compact-sidebar aside nav button svg { width: 1.25rem !important; height: 1.25rem !important; margin: 0 auto !important; }
        body.compact-sidebar aside div { display: none !important; }
      }
    `;
  }

  let styleTag = document.getElementById('dynamic-accent-theme');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'dynamic-accent-theme';
    document.head.appendChild(styleTag);
  }
  styleTag.innerHTML = css;
}

// =========================================================================
// MGA FEATURE VIEW COMPONENT
// =========================================================================
import LoginView from './components/shared/LoginView';
import DashboardView from './components/shared/DashboardView';
import AlumniManagementView from './components/shared/AlumniManagementView';
import EmployerManagementView from './components/roles/employer/EmployerManagementView';
import JobPostingsView from './components/shared/JobPostingsView';
import SkillsMatchingView from './components/shared/SkillsMatchingView';
import SurveysView from './components/shared/SurveysView';
import FeedbackView from './components/shared/FeedbackView';
// NOTE: Tinanggal natin ang import ng MessagingView dahil inalis na ang messaging feature.
import EmploymentView from './components/shared/EmploymentView';
import ReportsView from './components/shared/ReportsView';
import ActivityLogView from './components/roles/admin/ActivityLogView';
import ImportView from './components/roles/admin/ImportView';
import ExportView from './components/roles/admin/ExportView';
import NotificationsView from './components/shared/NotificationsView';
import SettingsView from './components/roles/admin/SettingsView';
import MessageEmailView from './components/roles/admin/MessageEmailView';

// =========================================================================
// MGA LAYOUT COMPONENT
// =========================================================================
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MobileMenu from './components/layout/MobileMenu';

// =========================================================================
// CUSTOM APPLICATION STATE HOOK (Dito galing ang global state at handlers)
// =========================================================================
import { useCareerPath } from './hooks/useCareerPath';

export default function App() {
  // Kuhanin ang application states, data listings, at state mutators mula sa ating custom hook
  const {
    activeUser,
    setActiveUser,
    currentTab,
    setCurrentTab,
    mobileMenuOpen,
    setMobileMenuOpen,
    profileDropdownOpen,
    setProfileDropdownOpen,
    users,
    alumniList,
    employers,
    jobPostings,
    surveys,
    notifications,
    isLoading,
    toastMessage,
    navigationItems,
    scopedAlumniList,
    scopedFeedbacks,
    scopedSurveyResponses,
    scopedLogs,
    handleLoginSuccess,
    handleLogout,
    handleSaveAlumni,
    handleDeleteAlumni,
    handleSaveEmployer,
    handleSaveJob,
    handleSaveSurvey,
    handleSubmitSurveyResponse,
    handleSaveFeedback,
    handleBulkImport,
    handleSendBatchReminders,
    handleInviteUserByEmail,
    handleDeleteUser,
    handleTriggerSingleEmailNudge,
    handleMarkNotifyRead,
    handleTabChange,
    appendActivity
  } = useCareerPath();

  // Apply saved global appearance settings on mount & activeUser changes
  useEffect(() => {
    if (!activeUser) return;
    
    // 1. Apply Dark Mode
    const isDark = localStorage.getItem('careerpath_dark_mode') === 'true';
    document.documentElement.classList.toggle('dark', isDark);

    // 2. Apply Font Size Scaling
    const size = localStorage.getItem('careerpath_font_size') || 'Normal';
    if (size === 'Small') {
      document.documentElement.style.fontSize = '14px';
    } else if (size === 'Large') {
      document.documentElement.style.fontSize = '18px';
    } else if (size === 'Extra Large') {
      document.documentElement.style.fontSize = '20px';
    } else {
      document.documentElement.style.fontSize = '16px';
    }

    // 3. Apply Accent Theme & Compact Sidebar
    const compact = localStorage.getItem('careerpath_compact_sidebar') === 'true';
    document.body.classList.toggle('compact-sidebar', compact);

    const colorAccent = localStorage.getItem('careerpath_color_accent') || 'BSC Crimson';
    applyAccentTheme(colorAccent);
  }, [activeUser]);

  // Magpakita ng full-screen loading spinner habang ina-initialize at sini-sync ang data mula sa database
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <RefreshCw className="w-12 h-12 text-[#1e4620] animate-spin mb-4" />
        <span className="text-sm font-bold text-slate-700 uppercase tracking-widest animate-pulse">Initializing CareerPath...</span>
      </div>
    );
  }

  // Kapag hindi naka-login, i-redirect at i-lock ang view sa LoginView
  if (!activeUser) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        users={users}
        onAddActivity={appendActivity}
      />
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">

      {/* Visual top indicator strip gamit ang opisyal na berdeng kulay ng eskwelahan */}
      <div className="bg-[#1e4620] h-1 w-full shrink-0" />

      {/* TOP HEADER BAR: Profile details, alert badges, at mobile togglers */}
      <Header
        activeUser={activeUser}
        notifications={notifications}
        setCurrentTab={setCurrentTab}
        profileDropdownOpen={profileDropdownOpen}
        setProfileDropdownOpen={setProfileDropdownOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        handleLogout={handleLogout}
      />

      {/* Main Layout Container (Sidebar + Content Stage Area) */}
      <div className="flex-1 flex flex-col md:flex-row relative min-h-0 overflow-hidden">

        {/* SIDEBAR: Static navigation panel na ipinapakita sa malalaking screen */}
        <Sidebar
          navigationItems={navigationItems}
          currentTab={currentTab}
          handleTabChange={handleTabChange}
        />

        {/* MOBILE MENU: Sliding mobile dropdown navigation link list para sa mobile screens */}
        <MobileMenu
          mobileMenuOpen={mobileMenuOpen}
          navigationItems={navigationItems}
          currentTab={currentTab}
          handleTabChange={handleTabChange}
          handleLogout={handleLogout}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* =========================================================================
            CORE STAGE WINDOW: Ipinapakita ang active view base sa currentTab state
            ========================================================================= */}
        <main className="flex-1 overflow-y-auto min-h-0 h-full w-full bg-slate-50 font-sans transition-all duration-300">
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">

            {/* Dashboard View: Nagpapakita ng stats summaries para sa admin, chairperson, employer, o alumni */}
            {currentTab === 'Dashboard' && (
              <DashboardView
                alumni={scopedAlumniList}
                employers={employers}
                jobPostings={jobPostings}
                logs={scopedLogs}
                onNavigate={setCurrentTab}
                userName={activeUser.name}
                activeUser={activeUser}
                feedbacks={scopedFeedbacks}
              />
            )}

            {/* Alumni Management: Admin view para sa pag-register, pag-update, at pag-filter ng mga alumni */}
            {currentTab === 'Alumni' && (
              <AlumniManagementView
                alumniList={scopedAlumniList}
                activeUser={activeUser}
                onSaveAlumni={handleSaveAlumni}
                onDeleteAlumni={handleDeleteAlumni}
                onTriggerEmail={handleTriggerSingleEmailNudge}
                onImportAlumni={handleBulkImport}
              />
            )}

            {/* My Profile: Direct profile access page para sa mga naka-login na Alumni */}
            {currentTab === 'My Profile' && (
              <AlumniManagementView
                alumniList={scopedAlumniList}
                activeUser={activeUser}
                onSaveAlumni={handleSaveAlumni}
                onImportAlumni={handleBulkImport}
              />
            )}

            {/* Employers View: Listahan ng mga partnered regional employers para sa admin */}
            {currentTab === 'Employers' && (
              <EmployerManagementView
                employers={employers}
                activeUser={activeUser}
                onSaveEmployer={handleSaveEmployer}
                onInviteEmployer={handleInviteUserByEmail}
              />
            )}

            {/* Job Postings View: Mga forms at tables para pamahalaan ang mga bakanteng trabaho ng partner employers */}
            {currentTab === 'Job Postings' && (
              <JobPostingsView
                jobPostings={jobPostings}
                employers={employers}
                activeUser={activeUser}
                onSaveJob={handleSaveJob}
              />
            )}

            {/* Skills Matching: Awtomatikong pag-match ng profile ng mga graduate sa requirements ng trabaho */}
            {/* NOTE: Ipinapasa ang activeUser at employers para ma-filter ang view kapag Employer ang naka-login. */}
            {currentTab === 'Skills Match' && (
              <SkillsMatchingView
                jobPostings={jobPostings}
                alumniList={scopedAlumniList}
                activeUser={activeUser}
                employers={employers}
              />
            )}

            {/* Surveys View: Nag-e-render ng mga tracer questionnaires ng BSC */}
            {currentTab === 'Surveys' && (
              <SurveysView
                surveys={surveys}
                activeUser={activeUser}
                onSaveSurvey={handleSaveSurvey}
                surveyResponses={scopedSurveyResponses}
                onSubmitResponse={handleSubmitSurveyResponse}
              />
            )}

            {/* Curriculum Feedback: Pagsusuri ng mga employer sa relevancy ng curriculum ng BSC */}
            {currentTab === 'Curriculum Feedback' && (
              <FeedbackView
                feedbacks={scopedFeedbacks}
                alumniList={scopedAlumniList}
                employers={employers}
                activeUser={activeUser}
                onSubmitFeedback={handleSaveFeedback}
              />
            )}

            {/* NOTE: Tinanggal natin ang render block ng MessagingView dahil inalis na ang messaging feature. */}

            {/* Reports View: Pag-compile at pag-print ng mga analytics reports para sa CHED audits */}
            {currentTab === 'Reports' && (
              <ReportsView
                alumniList={scopedAlumniList}
                activeUser={activeUser}
              />
            )}

            {/* Employment View: Dedicated graduate placement tracker at employed alumni directory */}
            {currentTab === 'Employment' && (
              <EmploymentView
                alumniList={scopedAlumniList}
                activeUser={activeUser}
              />
            )}

            {/* Activity Logs: Audit trail na nagpapakita ng lahat ng system activity */}
            {currentTab === 'Activity Log' && (
              <ActivityLogView
                logs={scopedLogs}
              />
            )}

            {/* Bulk Import View: Mag-upload ng CSV data para sa maramihang pag-insert ng graduates */}
            {currentTab === 'Import' && (
              <ImportView
                onImportAlumni={handleBulkImport}
                alumniList={scopedAlumniList}
              />
            )}

            {/* Database Export View: I-download ang registry data sa CSV o JSON format */}
            {currentTab === 'Export' && (
              <ExportView
                alumniList={scopedAlumniList}
              />
            )}

            {/* Notifications View: Nagpapakita ng detalyadong listahan ng mga notification ng user */}
            {currentTab === 'Notifications' && (
              <NotificationsView
                notifications={notifications}
                onMarkRead={handleMarkNotifyRead}
              />
            )}

            {/* Message/Email: Communication broadcaster for alumni reminders and trace audits */}
            {currentTab === 'Message/Email' && (activeUser?.role === 'Administrator' || activeUser?.role === 'Super Admin') && (
              <MessageEmailView
                alumniList={alumniList}
                activeUser={activeUser}
                users={users}
                onSendReminders={handleSendBatchReminders}
                onInviteUserByEmail={handleInviteUserByEmail}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {/* Settings: Personal settings, security preferences, alerts, and theme preferences */}
            {currentTab === 'Settings' && (
              <SettingsView
                activeUser={activeUser}
                setActiveUser={setActiveUser}
              />
            )}

          </div>
        </main>

      </div>

      {/* STATIC PAGE FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-4 px-6 text-center text-[10px] select-none shrink-0 font-sans">
        <p>&copy; Graduate Tracer &amp; Curriculum Review, Batanes State College.</p>
        <p className="mt-1 text-slate-600">Secure Graduate Tracer &bull; Basco, Batanes, Philippines</p>
      </footer>

      {/* CONFIRMATION OR WARNING TOAST POPUP: Ipinapakita kapag nagtagumpay ang isang operasyon, update, o alert */}
      {toastMessage && (() => {
        const isWarning = 
          toastMessage.toLowerCase().includes('error') ||
          toastMessage.toLowerCase().includes('fail') ||
          toastMessage.toLowerCase().includes('cannot') ||
          toastMessage.toLowerCase().includes('must') ||
          toastMessage.toLowerCase().includes('please') ||
          toastMessage.toLowerCase().includes('empty') ||
          toastMessage.toLowerCase().includes('invalid') ||
          toastMessage.toLowerCase().includes('resolve') ||
          toastMessage.toLowerCase().includes('warning');

        return (
          <div 
            id="save-success-toast" 
            className={`fixed bottom-6 right-6 ${
              isWarning ? 'bg-rose-950 border-rose-500/80' : 'bg-[#7c191e] border-amber-400'
            } text-white border shadow-2xl px-4 py-3 rounded-xl flex items-center gap-3 z-50 animate-bounce font-sans max-w-sm`}
          >
            <div className={`w-5 h-5 ${
              isWarning ? 'bg-rose-500 text-white' : 'bg-amber-400 text-slate-900'
            } rounded-full flex items-center justify-center font-black text-xs shrink-0 select-none`}>
              {isWarning ? '!' : '✓'}
            </div>
            <div className="space-y-0.5">
              <span className={`block text-[10px] font-extrabold uppercase tracking-widest ${
                isWarning ? 'text-rose-400' : 'text-amber-400'
              }`}>
                {isWarning ? 'Warning Alert' : 'Confirmation Alert'}
              </span>
              <span className="block text-[11px] font-semibold text-white leading-relaxed">{toastMessage}</span>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
