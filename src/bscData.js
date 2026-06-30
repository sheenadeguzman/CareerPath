/**
 * @file bscData.js
 * @description Standard static/specimen datasets na kumakatawan sa degree programs, default users,
 * alumni profiles, partner employers, job postings, tracer surveys, employer feedbacks, activity logs,
 * at notifications. Ginagamit ito bilang reference metrics at seed configurations para sa database imports.
 */

// Listahan ng mga opisyal na kurso o degree programs na inaalok sa Batanes State College (BSC)
export const BSC_PROGRAMS = [
  'Bachelor of Science in Information Technology',
  'Bachelor of Science in Hospitality Management',
  'Bachelor of Science in Tourism Management',
  'Bachelor of Science in Industrial Technology',
  'Bachelor of Science in Agriculture',
  'Bachelor of Elementary Education',
  'Bachelor of Secondary Education'
];

// Listahan ng mga opisyal na academic departments sa BSC
export const BSC_DEPARTMENTS = [
  'Information and Communication Technology Department',
  'Hospitality and Tourism Management Department',
  'Teacher Education Department',
  'Agriculture Department',
  'Industrial Technology Department'
];

// Mapa na nag-uugnay sa bawat Department sa kanilang kaukulang academic degree programs
export const DEPARTMENT_TO_PROGRAMS = {
  'Information and Communication Technology Department': ['Bachelor of Science in Information Technology'],
  'Hospitality and Tourism Management Department': ['Bachelor of Science in Hospitality Management', 'Bachelor of Science in Tourism Management'],
  'Teacher Education Department': ['Bachelor of Elementary Education', 'Bachelor of Secondary Education'],
  'Agriculture Department': ['Bachelor of Science in Agriculture'],
  'Industrial Technology Department': ['Bachelor of Science in Industrial Technology']
};

// Panimulang user accounts para sa mga test logins (mga Administrator, Department Chairperson, Alumni, at Employer)
export const INITIAL_USERS = [
  {
    id: 'bsc-admin-1',
    userId: 'admin',
    name: 'Sheena De Guzman',
    email: 'deguzmansheena30@gmail.com',
    role: 'Administrator',
    isInitialPasswordNeeded: true,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'bsc-chair-it',
    userId: 'chair_it',
    name: 'Dr. Mark Villanueva',
    email: 'chair.it@bsc.edu.ph',
    role: 'Department Chairperson',
    isInitialPasswordNeeded: true,
    program: 'Information and Communication Technology Department',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'bsc-chair-hm',
    userId: 'chair_hm',
    name: 'Prof. Angela Castro',
    email: 'chair.hm@bsc.edu.ph',
    role: 'Department Chairperson',
    isInitialPasswordNeeded: true,
    program: 'Hospitality and Tourism Management Department',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'bsc-chair-educ',
    userId: 'chair_educ',
    name: 'Dr. Evelyn Ramos',
    email: 'chair.educ@bsc.edu.ph',
    role: 'Department Chairperson',
    isInitialPasswordNeeded: true,
    program: 'Teacher Education Department',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'bsc-chair-agri',
    userId: 'chair_agri',
    name: 'Prof. Jose Diaz',
    email: 'chair.agri@bsc.edu.ph',
    role: 'Department Chairperson',
    isInitialPasswordNeeded: true,
    program: 'Agriculture Department',
    avatar: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'bsc-chair-tourism',
    userId: 'chair_tourism',
    name: 'Prof. Claire Cruz',
    email: 'chair.tourism@bsc.edu.ph',
    role: 'Department Chairperson',
    isInitialPasswordNeeded: true,
    program: 'Hospitality and Tourism Management Department',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'bsc-chair-tech',
    userId: 'chair_tech',
    name: 'Engr. Ronald Reyes',
    email: 'chair.tech@bsc.edu.ph',
    role: 'Department Chairperson',
    isInitialPasswordNeeded: true,
    program: 'Industrial Technology Department',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'BSC-2020-001',
    userId: 'BSC-2020-001',
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    role: 'Alumni',
    isInitialPasswordNeeded: true,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'BSC-2021-015',
    userId: 'BSC-2021-015',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@example.com',
    role: 'Alumni',
    isInitialPasswordNeeded: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'BSC-2022-008',
    userId: 'BSC-2022-008',
    name: 'Ana Reyes',
    email: 'ana.reyes@example.com',
    role: 'Alumni',
    isInitialPasswordNeeded: true,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'BSC-2019-022',
    userId: 'BSC-2019-022',
    name: 'Pedro Abad',
    email: 'pedro.abad@example.com',
    role: 'Alumni',
    isInitialPasswordNeeded: true,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'BSC-2023-003',
    userId: 'BSC-2023-003',
    name: 'Grace Tan',
    email: 'grace.tan@example.com',
    role: 'Alumni',
    isInitialPasswordNeeded: true,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'BSC-2021-041',
    userId: 'BSC-2021-041',
    name: 'Ricardo Gonzales',
    email: 'ricardo.gonzales@example.com',
    role: 'Alumni',
    isInitialPasswordNeeded: true,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120'
  },
  {
    id: 'employer-tech',
    userId: 'techbatanes',
    name: 'Mark Villanueva',
    email: 'hr@techbatanes.com',
    role: 'Employer',
    companyId: 'employer-tech',
    isInitialPasswordNeeded: true,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=120'
  }
];

// Panimulang Alumni profiles na may kumpletong tracer information at listahan ng kanilang mga kakayahan
export const INITIAL_ALUMNI = [
  {
    studentId: 'BSC-2020-001',
    name: 'Maria Santos',
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'maria.santos@example.com',
    phone: '09171234567',
    gender: 'Female',
    civilStatus: 'Single',
    dateOfBirth: '1999-05-12',
    address: 'Basco, Batanes',
    program: 'Bachelor of Science in Information Technology',
    yearGraduated: 2020,
    honors: 'Cum Laude',
    professionalExamPassed: 'None',
    employmentStatus: 'Employed',
    jobTitle: 'Software Developer',
    jobDescription: 'Develops and maintains web applications for a tech startup.',
    employerName: 'TechBatanes Inc.',
    employmentType: 'Regular/Permanent',
    sector: 'Private',
    monthlyIncome: '30,001 - 40,000',
    jobRelatedToCourse: 'Yes',
    timeToFirstJob: '1 to 6 months',
    skills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Python'],
    profileCompleteness: 95,
    lastUpdated: '2026-01-15T18:00:00Z'
  },
  {
    studentId: 'BSC-2021-015',
    name: 'Juan Dela Cruz',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'juan.delacruz@example.com',
    phone: '09123456789',
    gender: 'Male',
    civilStatus: 'Married',
    dateOfBirth: '1998-11-20',
    address: 'Ivana, Batanes',
    program: 'Bachelor of Science in Hospitality Management',
    yearGraduated: 2021,
    honors: 'None',
    professionalExamPassed: 'TESDA NC II',
    employmentStatus: 'Self-Employed',
    jobTitle: 'Homestay Owner',
    jobDescription: 'Manages family homestay lodging catering to provincial tourists.',
    employerName: 'Dela Cruz Homestay',
    employmentType: 'Self-Employed',
    sector: 'Private',
    monthlyIncome: '20,001 - 30,000',
    jobRelatedToCourse: 'Yes',
    timeToFirstJob: 'Immediate',
    skills: ['Customer Service', 'Cooking', 'Bookkeeping', 'Tourism Operations'],
    profileCompleteness: 85,
    lastUpdated: '2026-02-01T09:30:00Z'
  },
  {
    studentId: 'BSC-2022-008',
    name: 'Ana Reyes',
    firstName: 'Ana',
    lastName: 'Reyes',
    email: 'ana.reyes@example.com',
    phone: '09088765432',
    gender: 'Female',
    civilStatus: 'Single',
    dateOfBirth: '2000-01-30',
    address: 'Basco, Batanes',
    program: 'Bachelor of Elementary Education',
    yearGraduated: 2022,
    honors: 'None',
    professionalExamPassed: 'LET (Licensure Exam for Teachers)',
    employmentStatus: 'Employed',
    jobTitle: 'Elementary Instructor',
    jobDescription: 'Teaches Grade 3 elementary school pupils general academic topics.',
    employerName: 'Basco Elementary School',
    employmentType: 'Regular/Permanent',
    sector: 'Public',
    monthlyIncome: '20,001 - 30,000',
    jobRelatedToCourse: 'Yes',
    timeToFirstJob: '1 to 6 months',
    skills: ['Classroom Management', 'Lesson Planning', 'English Communication'],
    profileCompleteness: 90,
    lastUpdated: '2026-01-20T11:45:00Z'
  },
  {
    studentId: 'BSC-2019-022',
    name: 'Pedro Abad',
    firstName: 'Pedro',
    lastName: 'Abad',
    email: 'pedro.abad@example.com',
    phone: '09164448888',
    gender: 'Male',
    civilStatus: 'Single',
    dateOfBirth: '1997-08-15',
    address: 'Sabtang, Batanes',
    program: 'Bachelor of Science in Agriculture',
    yearGraduated: 2019,
    honors: 'None',
    professionalExamPassed: 'None',
    employmentStatus: 'Employed',
    jobTitle: 'Agricultural Inspector',
    jobDescription: 'Inspects regional crops, validates organic guidelines and coaches local farmers.',
    employerName: 'Department of Agriculture - Region II',
    employmentType: 'Regular/Permanent',
    sector: 'Public',
    monthlyIncome: '20,001 - 30,000',
    jobRelatedToCourse: 'Yes',
    timeToFirstJob: '7 to 11 months',
    skills: ['Crop Research', 'Pest Control Management', 'Organic Farming Strategy'],
    profileCompleteness: 92,
    lastUpdated: '2025-12-10T14:30:00Z'
  },
  {
    studentId: 'BSC-2023-003',
    name: 'Grace Tan',
    firstName: 'Grace',
    lastName: 'Tan',
    email: 'grace.tan@example.com',
    phone: '09223337777',
    gender: 'Female',
    civilStatus: 'Single',
    dateOfBirth: '2001-09-05',
    address: 'Basco, Batanes',
    program: 'Bachelor of Science in Tourism Management',
    yearGraduated: 2023,
    honors: 'None',
    professionalExamPassed: 'None',
    employmentStatus: 'Unemployed',
    jobTitle: '',
    jobDescription: '',
    employerName: '',
    employmentType: '',
    sector: 'N/A',
    monthlyIncome: '',
    jobRelatedToCourse: 'No',
    timeToFirstJob: '',
    skills: ['Itinerary Planning', 'Ticketing Coordination', 'Customer Hospitality'],
    profileCompleteness: 65,
    lastUpdated: '2026-03-02T16:20:00Z'
  },
  {
    studentId: 'BSC-2021-041',
    name: 'Ricardo Gonzales',
    firstName: 'Ricardo',
    lastName: 'Gonzales',
    email: 'ricardo.gonzales@example.com',
    phone: '09459998888',
    gender: 'Male',
    civilStatus: 'Single',
    dateOfBirth: '1999-02-18',
    address: 'Mahatao, Batanes',
    program: 'Bachelor of Science in Industrial Technology',
    yearGraduated: 2021,
    honors: 'None',
    professionalExamPassed: 'TESDA National Certificate',
    employmentStatus: 'Employed',
    jobTitle: 'Field Electronics Technician',
    jobDescription: 'Configures, services, and troubleshoots electronic equipment on site.',
    employerName: 'Basco Electronics Corp',
    employmentType: 'Regular/Permanent',
    sector: 'Private',
    monthlyIncome: '20,001 - 30,000',
    jobRelatedToCourse: 'Yes',
    timeToFirstJob: '1 to 6 months',
    skills: ['Circuit Diagnosis', 'Soldering', 'Pneumatics Troubleshooting'],
    profileCompleteness: 88,
    lastUpdated: '2026-01-05T10:15:00Z'
  }
];

// Panimulang Employer Profiles na kumakatawan sa mga kumpanya sa rehiyon ng Batanes
export const INITIAL_EMPLOYERS = [
  {
    id: 'employer-tech',
    companyName: 'TechBatanes Inc.',
    industry: 'Information Technology',
    address: 'Basco, Batanes',
    email: 'hr@techbatanes.com',
    phone: '09171234567',
    contactPerson: 'Mark Villanueva',
    position: 'HR Lead',
    companySize: '11-50',
    website: 'www.techbatanes.com',
    isVerified: true,
    vacanciesCount: 2
  },
  {
    id: 'employer-gov-da',
    companyName: 'Department of Agriculture - Region II',
    industry: 'Government',
    address: 'Basco, Batanes',
    email: 'da.region2@gov.ph',
    phone: '09187654321',
    contactPerson: 'Dr. Ramon Cruz',
    position: 'Director',
    companySize: '201-500',
    isVerified: true,
    vacanciesCount: 1
  },
  {
    id: 'employer-gov-bpg',
    companyName: 'Batanes Provincial Government',
    industry: 'Government',
    address: 'Basco, Batanes',
    email: 'governor@batanes.gov.ph',
    phone: '09165551212',
    contactPerson: 'Gov. Jun Aguto',
    position: 'Governor',
    companySize: '51-200',
    website: 'www.batanes.gov.ph',
    isVerified: true,
    vacanciesCount: 1
  }
];

// Panimulang listahan ng mga bakanteng trabaho (Job Vacancies) para sa matching at recruitment ng mga graduate
export const INITIAL_JOB_POSTINGS = [
  {
    id: 'job-1',
    jobTitle: 'Junior Web Developer',
    employerName: 'TechBatanes Inc.',
    description: 'Seeking a passionate developer who wants to build stable clean web interfaces.',
    requirements: ['JavaScript', 'React', 'HTML/CSS', 'MySQL', 'Git'],
    employmentType: 'Regular/Permanent',
    salaryRange: 'P 18,000 - P 25,000',
    location: 'Basco, Batanes',
    slots: 2,
    deadline: '2026-08-30',
    status: 'Open'
  },
  {
    id: 'job-2',
    jobTitle: 'Tour Operations Coordinator',
    employerName: 'Batanes Provincial Government',
    description: 'Coordinate tour logistics, heritage sessions, and environmental safeguards.',
    requirements: ['Excellent Communication', 'Customer Service', 'Hospitality', 'Tourism Operations'],
    employmentType: 'Contractual',
    salaryRange: 'P 15,000 - P 20,000',
    location: 'Basco, Batanes',
    slots: 1,
    deadline: '2026-07-15',
    status: 'Open'
  },
  {
    id: 'job-3',
    jobTitle: 'Farm Technician',
    employerName: 'Department of Agriculture - Region II',
    description: 'Research soil profiles and guide local farmers with modern eco-friendly crop fertilizers.',
    requirements: ['Crop Research', 'Organic Farming Strategy', 'Pest Control Management'],
    employmentType: 'Project-Based',
    salaryRange: 'P 12,000 - P 18,000',
    location: 'Basco, Batanes',
    slots: 3,
    deadline: '2026-09-01',
    status: 'Open'
  }
];

// Default na mga depinisyon para sa CHED Tracer surveys
export const INITIAL_SURVEYS = [
  {
    id: 'survey-1',
    title: 'CHED Graduate Tracer Study 2026',
    description: 'Annual graduate tracer study aligned with standard requirements to assess employability parameters of Batanes State College graduates.',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'Active',
    questions: [
      {
        id: 'q1',
        text: 'What is your primary employment status?',
        type: 'choice',
        options: ['Employed', 'Self-Employed', 'Unemployed']
      },
      {
        id: 'q2',
        text: 'Is your current job related to your college degree?',
        type: 'choice',
        options: ['Yes', 'No', 'Partially']
      },
      {
        id: 'q3',
        text: 'How long did it take you to land your first job?',
        type: 'choice',
        options: ['Immediate', '1 to 6 months', '7 to 11 months', '1 year or longer']
      }
    ],
    responsesCount: 3
  }
];

// Halimbawa ng mga feedback para sa curriculum review na isinumite ng mga katuwang na employer
export const INITIAL_FEEDBACKS = [
  {
    id: 'fb-1',
    subject: 'Excellent Technical Adaptability & React Performance',
    category: 'Curriculum Review',
    message: 'Maria Santos has shown remarkable performance in React, frontend engineering, and database queries. Her preparation aligns perfectly with our product timelines.',
    rating: 5,
    submittedBy: 'Mark Villanueva (hr@techbatanes.com)',
    submittedAt: '2026-06-17T18:30:00Z',
    alumniStudentId: 'BSC-2020-001',
    alumniName: 'Maria Santos',
    companyName: 'TechBatanes Inc.'
  },
  {
    id: 'fb-2',
    subject: 'Syllabus Alignment & Real-World Deployments',
    category: 'Curriculum Review',
    message: 'We appreciate the strong academic standard of education at Batanes State College. We recommend incorporating more cloud deployments in coursework.',
    rating: 4,
    submittedBy: 'Mark Villanueva (hr@techbatanes.com)',
    submittedAt: '2026-06-18T05:15:00Z',
    alumniStudentId: 'BSC-2020-001',
    alumniName: 'Maria Santos',
    companyName: 'TechBatanes Inc.'
  }
];

// Halimbawa ng mga system activity logs para sa pag-audit ng mga naging aksyon sa system
export const INITIAL_LOGS = [
  {
    id: 'log-1',
    timestamp: '2026-06-18T10:15:00-07:00',
    userId: 'bsc-admin-1',
    userEmail: 'deguzmansheena30@gmail.com',
    userName: 'Sheena De Guzman',
    userRole: 'Administrator',
    action: 'Imported Alumni Records via CSV',
    module: 'Import/Export',
    details: 'Successfully imported list of 6 alumni and created initial credentials.'
  }
];

// Panimulang configuration para sa mga notifications na ipapadala sa mga user
export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notify-1',
    title: 'Profile Incomplete Alert',
    text: 'Your alumni profile is below 80% completion. Please fill out details to align with CHED tracer data.',
    date: '2026-06-18T08:00:00Z',
    read: false
  }
];
