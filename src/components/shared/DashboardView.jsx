/**
 * @file DashboardView.jsx
 * @description Central dashboard router component. Dynamic na nag-mo-mount ng mga specific dashboard
 * (AdminDashboard, ChairpersonDashboard, EmployerDashboard, o AlumniDashboard) base sa role ng naka-login na user.
 */

import React from 'react';
import AlumniDashboard from '../roles/alumni/AlumniDashboard';
import EmployerDashboard from '../roles/employer/EmployerDashboard';
import ChairpersonDashboard from '../roles/chairperson/ChairpersonDashboard';
import AdminDashboard from '../roles/admin/AdminDashboard';

export default function DashboardView({ 
  alumni = [], 
  employers = [], 
  jobPostings = [], 
  logs = [], 
  onNavigate, 
  userName = '',
  activeUser,
  feedbacks = []
}) {
  // Kukuha ng role para malaman kung aling dashboard view ang dapat i-render
  const role = activeUser?.role || 'Administrator';

  return (
    <div className="relative">
      
      {/* Alumni Dashboard: I-mo-mount kapag ang role ay Alumni */}
      {role === 'Alumni' && (
        <AlumniDashboard
          alumni={alumni}
          activeUser={activeUser}
          jobPostings={jobPostings}
          feedbacks={feedbacks}
          onNavigate={onNavigate}
        />
      )}
      
      {/* Employer Dashboard: I-mo-mount kapag ang role ay Employer */}
      {role === 'Employer' && (
        <EmployerDashboard
          employers={employers}
          activeUser={activeUser}
          jobPostings={jobPostings}
          alumni={alumni}
          feedbacks={feedbacks}
          onNavigate={onNavigate}
        />
      )}
      
      {/* Chairperson Dashboard: I-mo-mount kapag ang role ay Department Chairperson */}
      {role === 'Department Chairperson' && (
        <ChairpersonDashboard
          alumni={alumni}
          activeUser={activeUser}
          jobPostings={jobPostings}
          feedbacks={feedbacks}
          onNavigate={onNavigate}
        />
      )}
      
      {/* Admin Dashboard: Default fallback view para sa mga Administrator at iba pang admin roles */}
      {role !== 'Alumni' && role !== 'Employer' && role !== 'Department Chairperson' && (
        <AdminDashboard
          alumni={alumni}
          employers={employers}
          jobPostings={jobPostings}
          logs={logs}
          onNavigate={onNavigate}
          userName={userName}
        />
      )}
    </div>
  );
}
