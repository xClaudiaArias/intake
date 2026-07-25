# Clinic Intake & Scheduling Portal

A portfolio project digitizing the patient intake process typically handled with paper forms at a medical office front desk. Patients register, complete intake forms, book appointments, and share pre-visit symptoms. Staff review intake status and manage the daily schedule.

See `SRS-Clinic-Intake-Portal.md` for the full requirements specification.

> **Note:** This project is designed with HIPAA-informed principles (RBAC, audit logging, encryption-ready fields) to demonstrate security-conscious engineering. It has not undergone a compliance audit and must never be used with real patient data.

## Stack
- **Backend:** Node.js, Express, PostgreSQL, Prisma
- **Frontend:** React (Vite), React Router, Axios

## Project structure
```
backend/
  prisma/schema.prisma   Data model
  prisma/seed.js         Demo data (synthetic only)
  src/
    controllers/         Business logic
    routes/               API route definitions
    middleware/           Auth, RBAC, error handling
    utils/                Prisma client, audit log helper
frontend/
  src/
    pages/patient/        Patient-facing screens
    pages/staff/           Staff dashboard
    context/AuthContext    Login state
    api/client.js          Axios instance with JWT attached
```

## Getting started

### 1. Database
Create a local Postgres database (or use Docker):
```bash
docker run --name clinic-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=clinic_portal -p 5432:5432 -d postgres:16
```

### 2. Backend
```bash
cd backend
cp .env.example .env    # then edit DATABASE_URL, JWT secrets
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev              # http://localhost:4000
```

> If you're pulling this update into an existing local database (one that
> already ran `--name init`), the `IntakeForm` model gained new columns
> (`demographics`, `emergencyContact`, `lifestyle`, `consent`). Run one more
> migration to pick them up:
> ```bash
> npx prisma migrate dev --name expand_intake_form
> ```
> Fresh clones don't need this extra step — `--name init` already captures
> the current schema in one go.

Demo logins after seeding:
- Staff: `nurse@demo-clinic.test` / `StaffDemo123!`
- Patient: `patient@demo-clinic.test` / `PatientDemo123!`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

## What's built vs. what's next
Implemented: registration/login (JWT), a full multi-section patient intake form (personal info, emergency contact, insurance with a US-payer dropdown, medical history, lifestyle, and consent — draft/submit, with the backend enforcing that consent is completed before submission), slot-based appointment booking with race-condition protection, symptom notes, staff daily dashboard with check-in, logout, and an append-only audit log.

Not yet built (see SRS section 3.9 for the full future-work list): a staff-facing page to view a submitted intake form's full contents (the API route `GET /api/v1/intake/:patientId` already exists for this — FR-2.4 — it just has no frontend yet), email notifications, admin UI for managing staff accounts and clinic hours, automated tests, and the cancellation-window enforcement (stubbed with a TODO in `appointments.controller.js`).

## Design system
The frontend uses a small custom token system (see the top of `frontend/src/App.css`) rather than a component library: a sage/pine color palette, `Space Grotesk` for headings, `Inter` for body text, and `IBM Plex Mono` for timestamps and data. Status values (appointments, intake forms) render as color-coded badges (`.badge--*` classes). `components/Layout.jsx` holds the shared header, role-based nav, and logout button that wraps every authenticated page.
