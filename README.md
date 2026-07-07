# SupportOps

SupportOps is an internal Team Management System for Support Engineers and QA Engineers. Module 1 establishes the production foundation: Next.js App Router, Supabase authentication, protected routes, role-based access, theme support, and the application shell.

## Tech Stack

- Next.js App Router with TypeScript
- Tailwind CSS
- Supabase Auth and Postgres
- shadcn-style local UI primitives
- next-themes for light/dark mode
- Zod and React Hook Form foundations
- Lucide icons
- Recharts and TanStack Table dependencies installed for upcoming modules

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment variables:

```bash
copy .env.example .env.local
```

Fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Apply the Supabase foundation migration:

```bash
supabase db push
```

If you are not using the Supabase CLI yet, open the Supabase SQL editor and run `supabase/migrations/001_foundation.sql`.

4. Create the first Manager user:

- In Supabase Auth, create a user for the Manager.
- Copy the user id.
- Insert a matching row in `profiles` with the `manager` role id.

5. Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Module 1 Scope

Implemented:

- Deployment-ready Next.js project structure
- Supabase SSR client setup
- Login and sign-out actions
- Protected application route group
- Role helpers and Manager-only settings route
- Sidebar, header, responsive mobile nav
- Light/dark mode
- Foundation dashboard shell
- Placeholder module pages for the approved PRD navigation
- Supabase foundation migration for roles, permissions, profiles, and RLS

Not implemented yet:

- Employee CRUD
- Attendance records
- Leave workflow
- Support logs
- QA testing tasks
- Scorecards
- Reports

Those modules will be implemented one at a time after approval.

## Module 2: Team Management

Implemented:

- Feature-based employee architecture in `src/features/employees`
- Reusable UI/data/feedback components for future screens
- Manager-only employee create, edit, and deactivate actions
- Supabase Auth user creation for new employees
- Employee profile page
- Employee list with search, role/status/shift filters, sorting, and pagination
- Role assignment: Manager, Support Engineer, QA Engineer
- Shift assignment: Morning, Day, Evening
- Employment status: Active, Inactive
- Avatar URL placeholder support
- Zod validation for employee forms
- Responsive table and form UI
- Loading, empty, and error states
- Supabase migration for employee code, shift, avatar URL, indexes, and updated-at trigger

Business decisions:

- Employee deletion is intentionally not implemented. Employees are deactivated to preserve reporting history.
- Creating an employee creates a Supabase Auth user and a SupportOps profile. This requires `SUPABASE_SERVICE_ROLE_KEY` on the server.
- Avatar upload is represented as an optional URL placeholder for now. Storage upload can be added in a later module.

Module 2 migration:

```bash
supabase db push
```

Or run `supabase/migrations/002_team_management.sql` in the Supabase SQL editor.

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
```
