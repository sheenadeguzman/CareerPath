/**
 * @file AlumniManagementView.jsx
 * @description Pangunahing controller view para sa Alumni Profiling.
 * Hinahati ang layout sa pagitan ng Admin view (AdminAlumniListView) at Alumnus self-profile view (AlumniSelfProfileForm).
 * Namamahala sa mga modal toggles para sa mga preview ng profile, manu-manong pagdaragdag, at pag-import ng validation.
 */

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import AlumniProfileModal from './AlumniProfileModal';
import AlumniSelfProfileForm from '../roles/alumni/AlumniSelfProfileForm';
import AdminAlumniListView from '../roles/admin/AdminAlumniListView';
import AddAlumnusModal from '../roles/admin/AddAlumnusModal';
import BulkImportModal from '../roles/admin/BulkImportModal';

export default function AlumniManagementView({ 
  alumniList, 
  activeUser, 
  onSaveAlumni, 
  onDeleteAlumni,
  onTriggerEmail, 
  onImportAlumni 
}) {
  // Sinusuri kung ang kasalukuyang user ay may role na 'Alumni' para i-toggle ang mga interface control
  const isAlumniUser = activeUser.role === 'Alumni';

  // State para sa mga Modal at Notification toast alerts
  const [viewingAlumni, setViewingAlumni] = useState(null); // Alumnus profile currently loaded in modal
  const [isAddingAlumnus, setIsAddingAlumnus] = useState(false); // Add alumnus modal visibility flag
  const [showImportModal, setShowImportModal] = useState(false); // Bulk CSV validation import modal toggle
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  /**
   * Nagti-trigger ng pansamantalang modal alert toast message.
   * @param {string} msg - Ang teksto ng alert content.
   */
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4000);
  };

  // Hinahanap ang profile coordinates ng naka-login na Alumnus user (gumagawa ng default mock profile kapag hindi nahanap)
  const currentAlAlumnus = isAlumniUser 
    ? (alumniList.find(a => a.studentId === activeUser.userId) || {
        studentId: activeUser.userId,
        name: activeUser.name,
        firstName: activeUser.name.split(' ')[0] || '',
        lastName: activeUser.name.split(' ').slice(1).join(' ') || '',
        email: activeUser.email,
        phone: '',
        gender: 'Male',
        civilStatus: 'Single',
        dateOfBirth: '',
        address: '',
        program: 'BS Information Technology',
        yearGraduated: 2026,
        honors: 'None',
        professionalExamPassed: 'None',
        employmentStatus: 'Unemployed',
        jobTitle: '',
        jobDescription: '',
        employerName: '',
        employmentType: 'Regular/Permanent',
        sector: 'Private',
        monthlyIncome: '20,001 - 30,000',
        jobRelatedToCourse: 'Yes',
        timeToFirstJob: 'Immediate',
        skills: [],
        profileCompleteness: 30,
        lastUpdated: new Date().toISOString()
      })
    : null;

  return (
    <div className="space-y-6 font-sans">
      
      {/* Popup ng Toast Notification */}
      {showToast && (
        <div 
          role="alert" 
          className="fixed top-24 right-8 bg-[#1e4620] text-emerald-50 font-bold text-xs p-4 rounded-xl border-2 border-amber-400 shadow-2xl z-50 flex items-center gap-2 max-w-sm animate-bounce"
        >
          <span className="bg-amber-400 text-slate-900 rounded-full p-1"><Check className="w-4 h-4" /></span>
          <p>{toastMessage}</p>
        </div>
      )}

      {/* Nag-re-render ng Alumni intake form o Administrator list view depende sa user role */}
      {isAlumniUser ? (
        <AlumniSelfProfileForm 
          currentAlAlumnus={currentAlAlumnus}
          onSaveAlumni={onSaveAlumni}
          triggerToast={triggerToast}
        />
      ) : (
        <AdminAlumniListView 
          alumniList={alumniList}
          activeUser={activeUser}
          onTriggerEmail={onTriggerEmail}
          setViewingAlumni={setViewingAlumni}
          setShowImportModal={setShowImportModal}
          setIsAddingAlumnus={setIsAddingAlumnus}
          onDeleteAlumni={onDeleteAlumni}
        />
      )}

      {/* Modal overlay para sa mga detalye ng profile ng Alumnus */}
      {viewingAlumni && (
        <AlumniProfileModal 
          alumni={viewingAlumni}
          onClose={() => setViewingAlumni(null)}
        />
      )}

      {/* Modal overlay para sa manu-manong pagrehistro ng Alumnus (creation form) */}
      {isAddingAlumnus && (
        <AddAlumnusModal 
          activeUser={activeUser}
          onSaveAlumni={onSaveAlumni}
          setIsAddingAlumnus={setIsAddingAlumnus}
          triggerToast={triggerToast}
        />
      )}

      {/* Modal overlay para sa bulk validation at pag-upload ng roster */}
      {showImportModal && (
        <BulkImportModal 
          alumniList={alumniList}
          onImportAlumni={onImportAlumni}
          setShowImportModal={setShowImportModal}
          triggerToast={triggerToast}
        />
      )}

    </div>
  );
}
