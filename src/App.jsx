/**
 * @file App.jsx
 * @description Core client-side React component ng BSC CareerPath Tracer.
 * Ito ang nagsisilbing pangunahing router at view switcher. Pinapamahalaan nito ang mga layout tulad ng
 * Header, Sidebar, MobileMenu, at tinatakda kung anong functional sub-view ang ipapakita base sa active tab.
 */

import React from 'react';
import { RefreshCw } from 'lucide-react';

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

            {/* Settings: Security settings, batch reminders, at account invitations */}
            {/* NOTE: Nilagyan natin ng role-check para tanging Administrator lamang ang pwedeng mag-render ng SettingsView. */}
            {currentTab === 'Settings' && (activeUser?.role === 'Administrator' || activeUser?.role === 'Super Admin') && (
              <SettingsView
                alumniList={alumniList}
                activeUser={activeUser}
                users={users}
                onSendReminders={handleSendBatchReminders}
                onInviteUserByEmail={handleInviteUserByEmail}
                onDeleteUser={handleDeleteUser}
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
