# Software Requirements Specification
## Clinic Intake & Scheduling Portal

**Version:** 1.0
**Date:** July 21, 2026
**Author:** Claudia Arias
**Status:** Draft

---

## 1. Introduction

### 1.1 Purpose
This document specifies the requirements for the Clinic Intake & Scheduling Portal (CISP), a web application that digitizes the patient registration process typically handled via paper forms at medical office front desks. It allows patients to self-register, check appointment availability, book appointments, and submit pre-visit symptom information, while giving clinic staff a dashboard to manage intake and scheduling.

This SRS follows an IEEE 830-inspired structure and is intended as a portfolio artifact demonstrating requirements engineering, system design, and full-stack implementation skills.

### 1.2 Scope
CISP is a two-sided web application:
- **Patient portal**: account management, intake forms, appointment booking, symptom updates.
- **Staff portal**: intake review, appointment/availability management, patient check-in.

The system is designed *as if* it will handle Protected Health Information (PHI) and follows HIPAA-informed design principles (access controls, audit logging, encryption, minimum necessary access) to demonstrate compliance-aware engineering. **It is not deployed with real patient data and does not undergo a formal HIPAA compliance audit** — this is explicitly a portfolio/demo project.

### 1.3 Intended Audience
- Hiring managers / technical reviewers evaluating this as a portfolio piece
- The developer (you), as a build reference
- Future contributors extending the project

### 1.4 Definitions & Acronyms
| Term | Definition |
|---|---|
| PHI | Protected Health Information |
| Patient | End user registering for or attending a clinic visit |
| Staff | Nurse or front-desk employee using the admin dashboard |
| Intake Form | Digital equivalent of the new-patient paper packet |
| Slot | A bookable unit of provider availability |
| PII | Personally Identifiable Information |

### 1.5 References
- HIPAA Security Rule (45 CFR Part 164, Subpart C) — used as design inspiration, not a compliance claim
- IEEE 830-1998 SRS template (structural reference)

---

## 2. Overall Description

### 2.1 Product Perspective
CISP is a standalone greenfield web application. It is not integrated with any real Electronic Health Record (EHR) or insurance clearinghouse in v1; those are modeled as future integration points.

### 2.2 User Classes and Characteristics
| User Class | Description | Technical Proficiency |
|---|---|---|
| New Patient | Registering for the first time | Low–medium |
| Returning Patient | Has an account, booking/updating info | Low–medium |
| Front Desk / Nurse (Staff) | Reviews intakes, manages schedule | Medium |
| Admin | Manages staff accounts, clinic settings | Medium–high |

### 2.3 Operating Environment
- Web application, responsive design (desktop + mobile browser)
- Backend hosted on a cloud provider (e.g., Render/Railway/AWS for portfolio demo)
- PostgreSQL database
- No native mobile app in v1

### 2.4 Design and Implementation Constraints
- Stack: React (frontend), Node.js/Express (backend/API), PostgreSQL (database)
- RESTful API architecture
- Authentication via JWT with refresh tokens
- Must be demoable with seeded/synthetic data only — no real PHI ever enters the system

### 2.5 Assumptions and Dependencies
- Single clinic, single location in v1 (multi-tenant is future work)
- One "provider" role is assumed (i.e., not modeling multiple doctors with separate calendars in v1, though the data model should not preclude it)
- Users have access to email for account verification

---

## 3. System Features (Functional Requirements)

Each feature includes a description, priority, and primary user stories. Priority: **P0** = must-have for MVP, **P1** = should-have, **P2** = stretch/future.

### 3.1 Account Registration & Authentication (P0)
- **FR-1.1**: Patients can create an account with email + password.
- **FR-1.2**: Email verification required before booking appointments.
- **FR-1.3**: Patients can log in/out and reset forgotten passwords.
- **FR-1.4**: Staff accounts are created by an Admin (not self-registered), with role-based access (Staff vs Admin).
- **FR-1.5**: Passwords stored using bcrypt/argon2 hashing; sessions via short-lived JWT + refresh token.

### 3.2 Patient Intake Form (P0)
- **FR-2.1**: New patients complete a digital intake form: demographics, contact info, emergency contact, insurance details, medical history (allergies, medications, prior conditions), consent acknowledgment.
- **FR-2.2**: Form data is saved as a draft if the patient leaves and returns before submitting.
- **FR-2.3**: Once submitted, the intake form is locked from patient edits but the patient can request an update, which routes to staff for approval (mirrors real clinic workflow where updates go through a nurse).
- **FR-2.4**: Staff can view a read-only, formatted version of the intake form.

### 3.3 Appointment Availability & Booking (P0)
- **FR-3.1**: Patients can view available appointment slots (date/time) for the clinic.
- **FR-3.2**: Patients can book, reschedule, or cancel an appointment (subject to a configurable cancellation window, e.g., 24 hours).
- **FR-3.3**: Staff can define/edit available slots (e.g., block off lunch, add extra hours).
- **FR-3.4**: Double-booking is prevented at the database and API level (unique constraint / transaction check).

### 3.4 Pre-Visit Symptom / Reason-for-Visit Update (P0)
- **FR-4.1**: Patients can attach a "reason for visit" and free-text symptom notes to an upcoming appointment.
- **FR-4.2**: Symptom notes are visible to staff on the appointment detail view, timestamped.
- **FR-4.3**: Patients can edit symptom notes up until check-in.

### 3.5 Staff Dashboard (P0)
- **FR-5.1**: Staff see a daily list of appointments with patient name, intake status (complete/incomplete), and check-in status.
- **FR-5.2**: Staff can mark a patient as "checked in."
- **FR-5.3**: Staff can search/filter patients by name or appointment date.

### 3.6 Audit Logging (P1 — HIPAA-informed design)
- **FR-6.1**: The system logs access to patient records (who viewed/edited what, when) to demonstrate audit-trail design.
- **FR-6.2**: Admins can view the audit log.

### 3.7 Notifications (P1)
- **FR-7.1**: Email confirmation on appointment booking/cancellation.
- **FR-7.2**: Email reminder 24 hours before appointment (via a scheduled job).

### 3.8 Admin Settings (P1)
- **FR-8.1**: Admin can manage staff accounts (create/deactivate).
- **FR-8.2**: Admin can configure clinic hours and appointment duration defaults.

### 3.9 Future Work (P2 — explicitly out of scope for v1)
- Multi-clinic / multi-provider support
- Real insurance eligibility verification via third-party API
- SMS reminders
- E-signature for consent forms
- Formal HIPAA compliance audit and BAA-covered hosting
- EHR integration (e.g., HL7/FHIR)

---

## 4. External Interface Requirements

### 4.1 User Interfaces
- Responsive web UI (React), separate route groups for Patient and Staff portals
- Accessibility target: WCAG 2.1 AA (semantic HTML, keyboard navigation, sufficient contrast)

### 4.2 API Interfaces
- RESTful JSON API (e.g., `/api/patients`, `/api/appointments`, `/api/intake-forms`)
- Versioned API (`/api/v1/...`) to demonstrate forward-compatible design

### 4.3 Hardware Interfaces
- None (standard web browser access)

### 4.4 Software Interfaces
- PostgreSQL (primary datastore)
- Email service (e.g., SendGrid/Resend) for verification and reminders
- Future: FHIR-compatible EHR API (out of scope v1)

---

## 5. Non-Functional Requirements

### 5.1 Security (HIPAA-informed)
- **NFR-1.1**: All traffic over HTTPS/TLS.
- **NFR-1.2**: PHI-equivalent fields (medical history, insurance info) encrypted at rest.
- **NFR-1.3**: Role-based access control (RBAC): patients can only access their own records; staff access is scoped to their clinic.
- **NFR-1.4**: Session timeout after period of inactivity.
- **NFR-1.5**: Audit log entries are immutable (append-only).
- **NFR-1.6**: Principle of minimum necessary access applied to staff roles.

### 5.2 Performance
- **NFR-2.1**: API responses under 300ms for standard CRUD operations (demo-scale data).
- **NFR-2.2**: Appointment availability view loads within 1 second.

### 5.3 Usability
- **NFR-3.1**: Intake form completable in under 10 minutes by an average user.
- **NFR-3.2**: Clear form validation with inline error messages.

### 5.4 Reliability & Availability
- **NFR-4.1**: Graceful error handling with user-friendly messages (no raw stack traces exposed).
- **NFR-4.2**: Database transactions used for booking to prevent race conditions on slot double-booking.

### 5.5 Maintainability
- **NFR-5.1**: Backend organized in layers (routes/controllers/services/data access) to demonstrate clean architecture.
- **NFR-5.2**: Automated tests for core booking and intake logic.

---

## 6. Data Model Overview (Preliminary)

Core entities (to be refined into full ERD during design phase):

- **User** (id, email, password_hash, role [patient/staff/admin], created_at)
- **PatientProfile** (id, user_id, name, dob, phone, address, emergency_contact)
- **IntakeForm** (id, patient_id, insurance_info, medical_history, status [draft/submitted/approved], submitted_at)
- **Appointment** (id, patient_id, slot_id, status [booked/cancelled/completed], reason_for_visit, symptom_notes)
- **Slot** (id, start_time, end_time, is_available)
- **AuditLog** (id, actor_id, action, target_type, target_id, timestamp)

---

## 7. Appendix

### 7.1 Out-of-Scope Disclaimer
This system is a portfolio/demonstration project. It is designed with HIPAA-informed principles to showcase security-conscious engineering, but has not undergone formal compliance certification and must never be used with real patient data.

### 7.2 Open Questions for Design Phase
- Single provider calendar vs. multi-provider from the start (affects Slot schema)?
- Should intake form updates require staff approval, or just log the change (simpler for MVP)?
