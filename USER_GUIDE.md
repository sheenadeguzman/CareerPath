# User’s Guide: BSC CareerPath System

This guide is designed to assist all users in navigating the BSC CareerPath platform. It provides clear instructions for all five user roles (Super Admin, Administrator, Department Chairperson, Employer, and Alumni) to ensure the effective use of the system’s alumni tracer, accreditation reporting, and career-matching capabilities.

---

## 1. System Requirements
Before accessing the system, ensure your device meets the following requirements:
*   **Web Browser**: Google Chrome, Mozilla Firefox, or Microsoft Edge.
*   **Internet Connection**: A stable connection is required to fetch map overlays, fetch real-time updates, or synchronize database states.
    *   *Offline Sync Support*: The system is equipped with offline synchronization. Any profile edits or survey responses made while offline are automatically saved locally and queued. They will be synchronized with the database as soon as an internet connection is restored.
*   **Account Credentials**: A valid institutional or registered email address.

---

## 2. Getting Started (Role-Based Access)

### 2.1. Super Admin
*   **Role Overview**: The root account designed for system-wide configuration, access control, and account governance.
*   **Privileges**: Full access to all modules plus exclusive access to the *System Users Directory* and *Tracer Invitations* inside the **Message/Email** tab.

### 2.2. Administrator (Admin)
*   **Role Overview**: Institutional managers who run day-to-day coordination, register graduates, broadcast reminders, and perform exports.
*   **Privileges**: Access to the Dashboard, Alumni Profiles, Job Vacancies, Surveys, Feedback, Reports, Import, Export, Settings, Activity Logs, and Message/Email tabs.

### 2.3. Department Chairperson
*   **Role Overview**: Scoped accounts for academic department leads (e.g. IT, HTM, Education, Agriculture, Tech) to audit curriculum alignment.
*   **Privileges**: Access to the Dashboard, Alumni Profiles, Job Vacancies, Surveys, Feedback, Reports, Import, Export, and Settings. All graduate lists and telemetry data are strictly filtered to their specific academic program.
*   *Note*: Department Chairpersons do not have access to system-wide Activity Logs or the Message/Email broadcast tab.

### 2.4. Employer
*   **Role Overview**: Partner enterprises looking to recruit graduates and review syllabus readiness.
*   **Privileges**: Access to the Dashboard, Job Vacancies, Skills Matching, Curriculum Feedback, and Settings.

### 2.5. Alumni (Graduate)
*   **Role Overview**: Graduates tracking placement statistics, staying compliant with institutional tracer audits, and finding jobs.
*   **Privileges**: Access to the Dashboard, My Profile, Job Vacancies, Skills Matching, Surveys, Curriculum Feedback, and Settings.
*   *Note*: Alumni accounts are restricted from accessing the placement density map and general graduate roster directories for privacy compliance.

---

## 3. Core Procedures (By Role)

### 3.1 Super Admin Procedures

#### A. Managing System Accounts & Directories
1.  Navigate to the **Message/Email** tab.
2.  Scroll down to the **System Users Directory (Super Admin Only)** section.
3.  Use the search bar to locate accounts by name, email, role, or User ID.
4.  Audit the **Verification Info** column to check if the user is on *Default Credentials* (initial temporary password) or has updated to a *Private Password*.
5.  To permanently delete any account, click the red **Delete (Trash)** button and confirm the popup warning. (Note: You cannot delete your own active session account).

#### B. Inviting System Users
1.  Go to the **Message/Email** tab.
2.  Under **"Invite New Tracer Registration"**, input the target email address and select the appropriate role (Super Admin, Administrator, Department Chairperson, Alumni, Employer).
3.  Click **Generate Login Credentials** to finalize registration. The temporary password will be initialized to `bsc123`.

---

### 3.2 Administrator Procedures

#### A. Bulk Importing Alumni Records (CSV/JSON)
1.  Go to the **Import** tab.
2.  Review the template format displayed inside the **Raw Text CSV Simulation Input** box to understand required headers (`studentId`, `firstName`, `lastName`, `email`, `program`, `yearGraduated`).
3.  Prepare your graduate registry spreadsheet (supports CSV or JSON formats).
4.  Drag and drop the spreadsheet file into the upload zone, or click to browse local files. Alternatively, paste the raw CSV text directly into the text box and click **Parse CSV Text Rows**.
5.  Verify the integrity audit table. The validation engine will flag critical errors (such as duplicate student IDs, invalid email formats) or warnings (programs not matching pre-defined degrees).
6.  Once free of critical errors, click **Confirm Roster Import** to batch-create profiles. The system will pre-configure temporary login credentials matching the graduate's Student ID.

#### B. Sending Incomplete Profile Batch Reminders
1.  Go to the **Message/Email** tab.
2.  Under the **"Tracer Update & Reminder Dispatch Workspace"**, choose the **"Pending"** recipient audience. This automatically targets graduates with a profile completeness index below 80%.
3.  Customize the email **Subject** and **Message Body** (you can use `{name}` as a placeholder to personalize).
4.  Click **Broadcast Message update to...** to trigger email notifications requesting profile updates.

#### C. Database Registry Export
1.  Go to the **Export** tab.
2.  Select your export format from the parameters dropdown:
    *   **Standard CSV Table Spreadsheet (.csv)**
    *   **Structured JSON Document (.json)**
    *   **Direct CHED GTS Template (.csv)** (matches official Commission on Higher Education survey formats).
3.  Click **Download Registry File** to obtain your local copy.

---

### 3.3 Department Chairperson Procedures

#### A. Auditing Scoped Placements & Course Analytics
1.  Log into your Chairperson account (e.g., `ICT Department`).
2.  Go to the **Alumni Profiles** tab. The database registry list will automatically filter and restrict data to graduates under your department's courses.
3.  Navigate to the **Reports** tab to review localized graduate employment rates, income brackets, and curricular job alignment charts.
    *   *Note*: Comparative rankings of other program metrics are locked from Chairperson views for security and are visible only to Portal Administrators.

#### B. Reviewing Departmental Accreditation Summaries
1.  Go to the **Reports** tab.
2.  Scroll to the bottom to view the **ANNEX A: CHED / AACCUP Accreditation Summary** table. It displays calculated placement indicators (active response rate, employment rate, degree-to-career alignment, 6-month landing rate) scoped strictly to your department.
3.  To download the complete telemetry report for accreditation audits, click the **Export** button at the top of the Reports page. This generates a landscape-compatible CHED Tracer CSV spreadsheet for your program.

---

### 3.4 Employer Procedures

#### A. Managing Job Postings
1.  Navigate to the **Job Vacancies** tab.
2.  Click **Post Job Vacancy**.
3.  Fill out the Job Title, Salary Range, Description, Location, and Required Skills (keywords separated by commas, e.g., `React, SQL, Java`).
4.  Click **Confirm Job Posting** to publish it to the Career Bulletin.

#### B. Scanning Matched Alumni
1.  Go to the **Skills Matching** tab.
2.  Select your posted job vacancy from the dropdown.
3.  Review the matching graduates roster. The match engine computes a **Hybrid Fit Score** (60% based on skills keywords overlap, 40% on academic program compatibility).
4.  Click **Contact Talented Grad** to initiate an administrative invitation.

#### C. Submitting Curriculum evaluations
1.  Go to the **Curriculum Feedback** tab and select the **"Curriculum"** category.
2.  Enter the subject topic (e.g., *Competency of BSIT Graduates*).
3.  Rate the graduate cohorts (1 to 5 stars) across five key dimensions: **Technical Skills, Communication, Problem Solving, Work Ethics, and Teamwork**.
4.  Input specific graduate strengths and recommended syllabus changes.
5.  Click **Submit Feedback**.

---

### 3.5 Alumni Procedures

#### A. Profile Management & Intake Form Submission
1.  Access the **My Profile** tab.
2.  Fill out your personal details, civil status, exam certifications, and skills keywords.
3.  Submit or save your changes. Your tracer profile must be active/registered to be scanned by hiring partner matches. Keep details updated regularly.

#### B. Answering Surveys
1.  Navigate to the **Surveys** tab.
2.  Under **"Active Surveys,"** select the assigned tracer form.
3.  Fill in your answers and click **Submit Response** to record compliance.

---

## 4. Troubleshooting & Support
*   **Forgot Password**: Click the **Forgot Password?** link on the login form, input your registered email address, and receive a **6-digit verification code**. Enter this code along with your new password on the screen to reset your credentials.
*   **Blank Login Screen**: The Clever Cloud platform runs the system within a secure iframe. If you encounter a blank page, make sure Third-Party Cookies are allowed in your browser settings.
*   **Inactivity Logout**: For your account security, you will be automatically logged out after 30 minutes of inactivity. Always save your updates.
