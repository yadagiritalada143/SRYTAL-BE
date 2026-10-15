# Code Review — Top 5 Action Items

Saved from the full codebase review (Sep 2026). No changes have been made yet.
We will pick these up when the time comes.

1. **Authorization on superadmin + role-gating everywhere**
   - `/superadmin` routes currently have no `validateJWT` / role check
     (`src/routes/superadminRoutes.ts`).
   - Most admin / recruiter / content-writer routes only use `validateJWT`
     (identity), not role enforcement (`authorizeAdmin.ts` is applied to only 3
     routes; `ADMIN_ROLES = ['admin']` also contradicts its comment about
     SuperAdmin).
   - Fix: apply JWT + role-gating middleware to every router; centralize roles
     in one constants module.

2. **Model-name / ref mismatches break Mongoose populate**
   - `employmentTypeModel.ts:15` registers with model name `''`.
   - `courseTaskModel.ts:6` refs `'CourseModuleModel'` (module registered as
     `'CourseModule'`).
   - `taskProgressModel.ts:23` refs `'CourseTask'` (model is `'CourseTaskModel'`).
   - Mixed casing: `'userModel'` / `'CourseModel'` / `'CourseAssignment'`.
   - Fix: standardize model names so every `ref` matches its registered name.

3. **Centralized error-handling middleware + hanging controller**
   - `src/index.ts` has no global error middleware and no
     `unhandledRejection` handler.
   - `addEmployeeRoleByAdminController.ts:20-22` catches an error but never
     sends a response (client hangs).
   - Fix: add a global error middleware + `asyncHandler`; use one consistent
     style (async/await) and one service error contract.

4. **Pagination + aggregation on list/dashboard endpoints**
   - No-pagination list queries: `getAllEmployeeDetailsByAdminService`,
     `getAllCourseAssignmentsService` (paginates via JS `.slice()`),
     `getAllEmployeesBySuperadminService`, `getAllTalentPoolCandidatesByRecruiterService`.
   - `getDashboardStatsByAdminService` fetches all employees + all packages and
     iterates nested timesheets synchronously.
   - `multer.memoryStorage()` with no size limits on all uploads.
   - Fix: DB-level pagination, aggregation pipelines, upload size limits.

5. **Normalize the timesheet data model**
   - `employeePackageModel.ts` nests `packages[].tasks[].timesheet[]` 3 levels
     deep; cron (`timesheetcronjob.ts:50-54`) adds ~31 entries/month/task →
     unbounded growth toward the 16MB document limit.
   - Comments on `talentPoolCandidatesModel` / `poolCompanies` also grow
     unbounded via `$push`.
   - Fix: move timesheets (and optionally comments) into their own collections.

---

Full review details (security, performance, type safety, dead deps, code smells)
are available in the conversation that produced this file.
