/**
 * @file db.js
 * @description MySQL connection pool configuration at automated schema migrations.
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// I-initialize ang MySQL Connection Pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bsc_careerpath',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Patakbuhin ang database migrations at i-validate ang connection.
 */
export async function initializeDatabase() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log(`Successfully connected to MySQL database. User count: ${rows[0].count}`);

    // MIGRATION 0: Siguraduhing MEDIUMTEXT ang avatar column para sa Base64 image files
    try {
      await pool.query('ALTER TABLE users MODIFY COLUMN avatar MEDIUMTEXT');
      console.log('Database Migration: Modified users.avatar column to MEDIUMTEXT if not already.');
    } catch (e) { }

    // MIGRATION: Add last_username_change to users if it doesn't exist
    try {
      await pool.query('ALTER TABLE users ADD COLUMN last_username_change TIMESTAMP NULL DEFAULT NULL');
      console.log('Database Migration: Added last_username_change column to users table.');
    } catch (e) { }

    // MIGRATION: Update users.role to support 'Super Admin'
    try {
      await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('Super Admin', 'Administrator', 'Department Chairperson', 'Alumni', 'Employer') NOT NULL");
      console.log("Database Migration: Updated users.role column to support Super Admin role.");
    } catch (e) {
      console.error("Database Migration Error: Failed to alter users.role ENUM:", e);
    }

    // MIGRATION: Add user_id column to notifications table if not exists
    try {
      await pool.query('ALTER TABLE notifications ADD COLUMN user_id VARCHAR(255) NULL DEFAULT NULL');
      console.log('Database Migration: Added user_id column to notifications table.');
    } catch (e) { }

    // MIGRATION: Seed default Super Admin user if not exists
    try {
      const [superCheck] = await pool.query("SELECT id FROM users WHERE id = 'bsc-super-admin'");
      if (superCheck.length === 0) {
        const hashedPassword = await bcrypt.hash('super123', 10);
        await pool.query(
          `INSERT INTO users (id, user_id, password, name, email, role, is_initial_password_needed, avatar) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'bsc-super-admin',
            'superadministrator',
            hashedPassword,
            'Super Administrator',
            'superadmin@bsc.edu.ph',
            'Super Admin',
            1,
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=120'
          ]
        );
        console.log("Database Migration: Seeded default Super Admin user (UserID: superadministrator / Pass: super123)");
      }
    } catch (e) {
      console.error("Database Migration Error: Failed to seed Super Admin user:", e);
    }


    // MIGRATION 1: Siguraduhing may columns ang feedbacks table
    try {
      await pool.query('ALTER TABLE feedbacks ADD COLUMN alumni_student_id VARCHAR(50) DEFAULT NULL');
      console.log('Database Migration: Added alumni_student_id column to feedbacks table if not exists.');
    } catch (e) { }
    try {
      await pool.query('ALTER TABLE feedbacks ADD COLUMN alumni_name VARCHAR(100) DEFAULT NULL');
      console.log('Database Migration: Added alumni_name column to feedbacks table if not exists.');
    } catch (e) { }
    try {
      await pool.query('ALTER TABLE feedbacks ADD COLUMN company_name VARCHAR(100) DEFAULT NULL');
      console.log('Database Migration: Added company_name column to feedbacks table if not exists.');
    } catch (e) { }

    // MIGRATION 2: Siguraduhing mabilis tumakbo ang database queries sa pamamagitan ng pag-index sa alumni_profiles
    try {
      await pool.query('ALTER TABLE alumni_profiles ADD INDEX idx_program (program)');
      console.log('Database Migration: Added index idx_program on alumni_profiles table if not exists.');
    } catch (e) { }
    try {
      await pool.query('ALTER TABLE alumni_profiles ADD INDEX idx_employment_status (employment_status)');
      console.log('Database Migration: Added index idx_employment_status on alumni_profiles table if not exists.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN location_region VARCHAR(100) DEFAULT 'Local (Batanes)'");
      console.log('Database Migration: Added location_region column to alumni_profiles table if not exists.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN career_history TEXT DEFAULT NULL");
      console.log('Database Migration: Added career_history column to alumni_profiles table if not exists.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN reasons_pursuing_program VARCHAR(255) DEFAULT NULL");
      console.log('Database Migration: Added reasons_pursuing_program column to alumni_profiles.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN find_first_job VARCHAR(255) DEFAULT NULL");
      console.log('Database Migration: Added find_first_job column to alumni_profiles.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN reasons_accepting_job VARCHAR(255) DEFAULT NULL");
      console.log('Database Migration: Added reasons_accepting_job column to alumni_profiles.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN useful_skills TEXT DEFAULT NULL");
      console.log('Database Migration: Added useful_skills column to alumni_profiles.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN reasons_unemployment VARCHAR(255) DEFAULT NULL");
      console.log('Database Migration: Added reasons_unemployment column to alumni_profiles.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN middle_name VARCHAR(50) DEFAULT NULL");
      console.log('Database Migration: Added middle_name column to alumni_profiles.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN suffix VARCHAR(10) DEFAULT NULL");
      console.log('Database Migration: Added suffix column to alumni_profiles.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN year_enrolled INT DEFAULT NULL");
      console.log('Database Migration: Added year_enrolled column to alumni_profiles.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN alumni_association_status ENUM('Active Member', 'Inactive Member', 'Officer', 'Non-Member') DEFAULT 'Non-Member'");
      console.log('Database Migration: Added alumni_association_status column to alumni_profiles.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN is_board_passer ENUM('Yes', 'No', 'N/A') DEFAULT 'N/A'");
      console.log('Database Migration: Added is_board_passer column to alumni_profiles.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN licensure_exam_date VARCHAR(50) DEFAULT NULL");
      console.log('Database Migration: Added licensure_exam_date column to alumni_profiles.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN license_no VARCHAR(50) DEFAULT NULL");
      console.log('Database Migration: Added license_no column to alumni_profiles.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN job_industry VARCHAR(100) DEFAULT NULL");
      console.log('Database Migration: Added job_industry column to alumni_profiles.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN first_job_related_to_course ENUM('Yes', 'No', 'Partially') DEFAULT 'No'");
      console.log('Database Migration: Added first_job_related_to_course column to alumni_profiles.');
    } catch (e) { }

    // MIGRATION: Siguraduhing may tamang assigned academic program/department ang bawat Department Chairperson account at Alumni profiles.
    try {
      // 1. I-update ang mga chairperson users sa kanilang kaukulang opisyal na Department names at bagong user_ids (Department itself)
      // Una, i-rename ang existing user_ids kung sila ay nasa lumang format pa
      try {
        await pool.query("UPDATE users SET user_id = 'ICT Department' WHERE user_id = 'chair_it'");
        await pool.query("UPDATE users SET user_id = 'HTM Department' WHERE user_id = 'chair_htm'");
        await pool.query("UPDATE users SET user_id = 'Teacher Education Department' WHERE user_id = 'chair_educ'");
        await pool.query("UPDATE users SET user_id = 'Agriculture Department' WHERE user_id = 'chair_agri'");
        await pool.query("UPDATE users SET user_id = 'Industrial Technology Department' WHERE user_id IN ('chair_tech', 'chair_industech')");
        console.log("Database Migration: Migrated legacy chairperson user_ids to official department names.");
      } catch (e) {
        console.error("Database Migration Error during user_id rename:", e);
      }

      await pool.query("UPDATE users SET program = 'Information and Communication Technology Department' WHERE user_id = 'ICT Department'");
      await pool.query("UPDATE users SET program = 'Teacher Education Department' WHERE user_id = 'Teacher Education Department'");
      await pool.query("UPDATE users SET program = 'Agriculture Department' WHERE user_id = 'Agriculture Department'");
      await pool.query("UPDATE users SET program = 'Industrial Technology Department' WHERE user_id = 'Industrial Technology Department'");

      // Clean up old chairpersons and migrate to combined HTM chairperson
      try {
        const [oldChairs] = await pool.query("SELECT id FROM users WHERE user_id IN ('chair_hm', 'chair_tourism')");
        if (oldChairs.length > 0) {
          await pool.query("DELETE FROM users WHERE user_id IN ('chair_hm', 'chair_tourism')");
          console.log("Database Migration: Deleted legacy chair_hm and chair_tourism accounts.");
        }
      } catch (err) { }

      try {
        const [htmCheck] = await pool.query("SELECT id FROM users WHERE user_id = 'HTM Department'");
        if (htmCheck.length === 0) {
          const hashedPassword = await bcrypt.hash('chair123', 10);
          await pool.query(
            `INSERT INTO users (id, user_id, password, name, email, role, is_initial_password_needed, program, avatar) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              'bsc-chair-htm',
              'HTM Department',
              hashedPassword,
              'Prof. Angela Castro',
              'chair.htm@bsc.edu.ph',
              'Department Chairperson',
              1,
              'Hospitality and Tourism Management Department',
              'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120'
            ]
          );
          console.log("Database Migration: Seeded combined Hospitality and Tourism Management Chairperson (HTM Department)");
        } else {
          await pool.query("UPDATE users SET program = 'Hospitality and Tourism Management Department' WHERE user_id = 'HTM Department'");
        }
      } catch (err) {
        console.error("Database Migration Error: Failed to seed HTM Department account:", err);
      }

      // 2. I-update ang mga alumni profiles mula sa lumang maikling BS labels papunta sa mga opisyal na kurso ng BSC
      await pool.query("UPDATE alumni_profiles SET program = 'Bachelor of Science in Information Technology' WHERE program = 'BS Information Technology'");
      await pool.query("UPDATE alumni_profiles SET program = 'Bachelor of Science in Hospitality Management' WHERE program = 'BS Hospitality Management'");
      await pool.query("UPDATE alumni_profiles SET program = 'Bachelor of Elementary Education' WHERE program = 'BS Elementary Education'");
      await pool.query("UPDATE alumni_profiles SET program = 'Bachelor of Science in Agriculture' WHERE program = 'BS Agriculture'");
      await pool.query("UPDATE alumni_profiles SET program = 'Bachelor of Science in Tourism Management' WHERE program = 'BS Tourism Management'");
      await pool.query("UPDATE alumni_profiles SET program = 'Bachelor of Science in Industrial Technology' WHERE program = 'BS Industrial Technology'");

      console.log('Database Migration: Successfully updated and verified official program and department fields for all users.');
    } catch (err) {
      console.error('Database Migration Error: Failed to assign chairperson department or alumni program coordinates:', err);
    }

    // MIGRATION 2.5: Siguraduhing may is_initial_password_needed = 1 ang admin kung default pa ang password nito
    try {
      const [adminRows] = await pool.query("SELECT password FROM users WHERE user_id = 'admin'");
      if (adminRows.length > 0) {
        const adminPassword = adminRows[0].password;
        // Check if it is plaintext 'admin123' or matches the hashed value of 'admin123'
        const isDefault = adminPassword === 'admin123' || await bcrypt.compare('admin123', adminPassword);
        if (isDefault) {
          await pool.query("UPDATE users SET is_initial_password_needed = 1 WHERE user_id = 'admin'");
          console.log("Database Migration: Admin account is using the default password. Prompt enabled.");
        } else {
          await pool.query("UPDATE users SET is_initial_password_needed = 0 WHERE user_id = 'admin'");
          console.log("Database Migration: Admin has configured a secure password. Prompt disabled.");
        }
      }
    } catch (err) {
      console.error('Database Migration Error: Failed to update admin is_initial_password_needed flag:', err);
    }

    // MIGRATION 2.6: Linisin ang mga system activity logs na napunta sa feedbacks table
    try {
      const [result] = await pool.query("DELETE FROM feedbacks WHERE message LIKE '[LOG EVENT]%'");
      if (result.affectedRows > 0) {
        console.log(`Database Migration: Purged ${result.affectedRows} activity log records from feedbacks table.`);
      }
    } catch (err) {
      console.error('Database Migration Error: Failed to purge activity logs from feedbacks table:', err);
    }
    // MIGRATION: Add job_start_year to alumni_profiles table if missing
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN job_start_year VARCHAR(50) DEFAULT NULL");
      console.log('Database Migration: Added job_start_year column to alumni_profiles table.');
    } catch (e) { }

    // MIGRATION: Add education_history to alumni_profiles table if missing
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN education_history TEXT DEFAULT NULL");
      console.log('Database Migration: Added education_history column to alumni_profiles table.');
    } catch (e) { }

    // MIGRATION: Add about_me to alumni_profiles table if missing
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN about_me TEXT DEFAULT NULL");
      console.log('Database Migration: Added about_me column to alumni_profiles table.');
    } catch (e) { }

    // MIGRATION: Add custom contact columns to job_postings table if missing
    try {
      await pool.query("ALTER TABLE job_postings ADD COLUMN contact_person VARCHAR(100) DEFAULT NULL");
      console.log('Database Migration: Added contact_person column to job_postings table.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE job_postings ADD COLUMN contact_email VARCHAR(100) DEFAULT NULL");
      console.log('Database Migration: Added contact_email column to job_postings table.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE job_postings ADD COLUMN contact_phone VARCHAR(50) DEFAULT NULL");
      console.log('Database Migration: Added contact_phone column to job_postings table.');
    } catch (e) { }
    try {
      await pool.query("ALTER TABLE job_postings ADD COLUMN contact_website VARCHAR(255) DEFAULT NULL");
      console.log('Database Migration: Added contact_website column to job_postings table.');
    } catch (e) { }

    // MIGRATION: Add languages to alumni_profiles table if missing
    try {
      await pool.query("ALTER TABLE alumni_profiles ADD COLUMN languages TEXT DEFAULT NULL");
      console.log('Database Migration: Added languages column to alumni_profiles table.');
    } catch (e) { }


    // MIGRATION 3: Awtomatikong i-hash ang plain-text user passwords para sa seguridad ng database
    try {
      const [usersToMigrate] = await pool.query('SELECT id, password FROM users');
      let migratedCount = 0;
      for (const u of usersToMigrate) {
        const isHashed = u.password.startsWith('$2a$') || u.password.startsWith('$2b$') || u.password.startsWith('$2y$');
        if (!isHashed) {
          const hashedPassword = await bcrypt.hash(u.password, 10);
          await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, u.id]);
          migratedCount++;
        }
      }
      if (migratedCount > 0) {
        console.log(`Database Migration: Secured and hashed ${migratedCount} plaintext user password records.`);
      }
    } catch (err) {
      console.error('Database Migration Error: Failed to secure plaintext passwords:', err);
    }

    // MIGRATION: Add standard created_at and updated_at columns to all tables if missing
    const tablesToMigrate = [
      { name: 'users', addCreated: false, addUpdated: true },
      { name: 'alumni_profiles', addCreated: true, addUpdated: true },
      { name: 'employers', addCreated: false, addUpdated: true },
      { name: 'job_postings', addCreated: false, addUpdated: true },
      { name: 'surveys', addCreated: false, addUpdated: true },
      { name: 'feedbacks', addCreated: true, addUpdated: true },
      { name: 'activity_logs', addCreated: true, addUpdated: true },
      { name: 'survey_responses', addCreated: true, addUpdated: true },
      { name: 'notifications', addCreated: true, addUpdated: true }
    ];

    for (const table of tablesToMigrate) {
      if (table.addCreated) {
        try {
          await pool.query(`ALTER TABLE ${table.name} ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`);
          console.log(`Database Migration: Added created_at column to ${table.name} table.`);
        } catch (e) {
          // Ignore if column already exists or query fails
        }
      }
      if (table.addUpdated) {
        try {
          await pool.query(`ALTER TABLE ${table.name} ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
          console.log(`Database Migration: Added updated_at column to ${table.name} table.`);
        } catch (e) {
          // Ignore if column already exists or query fails
        }
      }
    }

    // MIGRATION: Alisin ang "CHED" at "Study 2026" sa default survey title para maging "Graduate Tracer" na lang
    try {
      await pool.query("UPDATE surveys SET title = 'Graduate Tracer' WHERE id = 'survey-1'");
      console.log("Database Migration: Updated default survey title to 'Graduate Tracer'.");
    } catch (e) { }

    // MIGRATION: I-sync ang vacancies_count sa employers table sa kabuuang slots ng kanilang mga bukas na trabaho
    try {
      await pool.query(`
        UPDATE employers e
        SET e.vacancies_count = COALESCE(
          (SELECT SUM(slots) FROM job_postings WHERE employer_name = e.company_name AND status = 'Open'),
          0
        )
      `);
      console.log("Database Migration: Synchronized employers.vacancies_count with job_postings open slots.");
    } catch (e) { }
  } catch (err) {
    console.error('WARNING: Could not connect to MySQL database. Please verify your XAMPP installation and import bsc_careerpath_mysql.sql.', err);
  }
}
