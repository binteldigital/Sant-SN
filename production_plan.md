
Sunu Santé - Production Roadmap & Architecture Plan
This document outlines the architectural transformation of the Sunu Santé prototype into a production-ready healthcare management system.

1. Core Architecture Overhaul
Transition from static JSON mock data to a persistent relational database.

Database Schema (PostgreSQL)
Users Table: id, email, password_hash, role (admin, doctor, patient), full_name, phone, created_at.
Hospitals Table: id, name, type, address, latitude, longitude, contact_info, services, images_urls.
Pharmacies Table: id, name, address, on_duty_status, contact_info.
Appointments Table: id, patient_id, hospital_id, doctor_id, date_time, status (pending, confirmed, cancelled).
MedicalRecords Table: id, patient_id, data, last_updated.
2. Admin Panel Features
A centralized dashboard to manage the entire ecosystem.

User & Access Management
RBAC (Role-Based Access Control):
Super Admin: Full system access, log monitoring, database backups.
Hospital Admin: Manage their own facility's data, doctors, and schedules.
Support: View appointments and user queries only.
User Account Management: Create, suspend, or delete user accounts directly from the UI.
Content Management (No-Code Personalization)
Facility Manager: Add/Edit/Delete hospitals and pharmacies.
Dynamic UI Controls: Change branding colors (Emerald Green), hero text, and featured facilities without code changes.
Duty Schedule: Automated toggle for "Pharmacies de Garde".
3. Communication & Integration Layer
SMTP (Email):
Integration: SendGrid or AWS SES.
Use Cases: Welcome emails, appointment confirmations, password resets.
SMS Gateway:
Integration: Twilio or Africa's Talking (for regional Dakar support).
Use Cases: Appointment reminders, 2FA for secure logins.
Secrets Management: All API keys and credentials must be stored in Replit Secrets (Environment Variables).
4. Security & Compliance
Authentication: JWT (JSON Web Tokens) with secure HTTP-only cookies.
Data Privacy: Encryption of sensitive medical data at rest.
Validation: Strict server-side input validation for all forms.
5. Development Phases
Phase 1: Set up PostgreSQL database and migrate existing static data.
Phase 2: Implement Backend API (Node.js/Express) with Auth.
Phase 3: Build the Admin Panel UI (React) with CRUD operations.
Phase 4: Integrate SMTP and SMS services.
Phase 5: Final testing and deployment configuration.