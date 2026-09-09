/**
 * Seeds the navigation catalog (nav-items) and behaviour-preserving default
 * role grants (nav-role-access) for every organization. Idempotent — safe to
 * re-run; it upserts catalog items by key and only creates role grants that
 * don't already exist (so admin customizations are never overwritten).
 *
 * Run:  node scripts/seed-nav-catalog.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

// ── Catalog (the app's real pages) ───────────────────────────────────────────
const CATALOG = [
  // Employee surface
  { key: 'employee.profile', label: 'My Profile', url: 'employee/dashboard/profile', icon: 'IconUserEdit', surface: 'employee', order: 1, isSystem: true },
  { key: 'employee.dashboard', label: 'Dashboard', url: 'employee/dashboard', icon: 'IconLayoutDashboard', surface: 'employee', order: 2 },
  { key: 'employee.timesheet', label: 'Timesheet', url: 'employee/dashboard/timesheet', icon: 'IconCalendarTime', surface: 'employee', order: 3 },
  { key: 'employee.content-writer', label: 'Content Writer', url: 'employee/dashboard/content-writer', icon: 'IconBook', surface: 'employee', order: 4 },
  { key: 'employee.my-courses', label: 'My Courses', url: 'employee/dashboard/course-assignments', icon: 'IconBook', surface: 'employee', order: 5 },
  { key: 'employee.talent-pool', label: 'Talent Pool', icon: 'IconUserStar', surface: 'employee', order: 6 },
  { key: 'employee.pool-candidates', label: 'Pool Candidates', url: 'employee/dashboard/pool-candidates', icon: 'IconUsersGroup', surface: 'employee', parentKey: 'employee.talent-pool', order: 7 },
  { key: 'employee.pool-companies', label: 'Pool Companies', url: 'employee/dashboard/pool-companies', icon: 'IconBuildings', surface: 'employee', parentKey: 'employee.talent-pool', order: 8 },
  { key: 'employee.reports', label: 'Reports', icon: 'IconNotebook', surface: 'employee', order: 9 },
  { key: 'employee.salary-slip', label: 'Salary Slip', url: 'employee/dashboard/reports/salary-slip', icon: 'IconReportMoney', surface: 'employee', parentKey: 'employee.reports', order: 10 },

  // Admin surface
  { key: 'admin.dashboard', label: 'Dashboard', url: 'admin/dashboard', icon: 'IconLayoutDashboard', surface: 'admin', order: 1 },
  { key: 'admin.employees', label: 'Employees', url: 'admin/dashboard/employees', icon: 'IconUsers', surface: 'admin', order: 2 },
  { key: 'admin.profile', label: 'Profile', url: 'admin/dashboard/profile', icon: 'IconUserEdit', surface: 'admin', order: 3, isSystem: true },
  { key: 'admin.packages', label: 'Packages', url: 'admin/dashboard/packages', icon: 'IconPackage', surface: 'admin', order: 4 },
  { key: 'admin.notification', label: 'Notification', url: 'admin/dashboard/notification', icon: 'IconNotification', surface: 'admin', order: 5 },
  { key: 'admin.talent-pool', label: 'Talent Pool', icon: 'IconUserStar', surface: 'admin', order: 6 },
  { key: 'admin.pool-candidates', label: 'Pool Candidates', url: 'admin/dashboard/pool-candidates', icon: 'IconUsersGroup', surface: 'admin', parentKey: 'admin.talent-pool', order: 7 },
  { key: 'admin.pool-companies', label: 'Pool Companies', url: 'admin/dashboard/pool-companies', icon: 'IconBuildings', surface: 'admin', parentKey: 'admin.talent-pool', order: 8 },
  { key: 'admin.payroll', label: 'Payroll Management', icon: 'IconNotebook', surface: 'admin', order: 9 },
  { key: 'admin.salary-slip', label: 'Generate Salary Slip', url: 'admin/dashboard/reports/generate-salary-slip', icon: 'IconReportMoney', surface: 'admin', parentKey: 'admin.payroll', order: 10 },
  { key: 'admin.payroll-reports', label: 'Payroll Reports', url: 'admin/dashboard/reports/all-employee-reports', icon: 'IconReport', surface: 'admin', parentKey: 'admin.payroll', order: 11 },
  { key: 'admin.settings', label: 'Settings', url: 'admin/dashboard/settings', icon: 'IconSettings', surface: 'admin', order: 12, isSystem: true }
];

// Default grants per role = exactly what each role sees today.
const DEFAULT_ROLE_GRANTS = {
  Employee: ['employee.profile', 'employee.dashboard', 'employee.timesheet', 'employee.my-courses', 'employee.reports', 'employee.salary-slip'],
  Recruiter: ['employee.profile', 'employee.dashboard', 'employee.timesheet', 'employee.my-courses', 'employee.talent-pool', 'employee.pool-candidates', 'employee.pool-companies', 'employee.reports', 'employee.salary-slip'],
  ContentWriter: ['employee.profile', 'employee.dashboard', 'employee.content-writer', 'employee.my-courses', 'employee.reports', 'employee.salary-slip'],
  admin: CATALOG.filter(i => i.surface === 'admin').map(i => i.key)
};

(async () => {
  await mongoose.connect(process.env.DB_CONNECTION_STRING, { dbName: process.env.DB_NAME });
  const db = mongoose.connection.db;

  // 1) Upsert catalog by key
  for (const item of CATALOG) {
    await db.collection('nav-items').updateOne(
      { key: item.key },
      { $set: { parentKey: null, ...item } },
      { upsert: true }
    );
  }
  console.log(`Catalog upserted: ${CATALOG.length} items`);

  // 2) Seed default role grants for every organization (only if missing)
  const orgs = await db.collection('organization').find({}).project({ _id: 1 }).toArray();
  let created = 0;
  for (const org of orgs) {
    for (const [role, navKeys] of Object.entries(DEFAULT_ROLE_GRANTS)) {
      const existing = await db.collection('nav-role-access').findOne({ organization: org._id, role });
      if (!existing) {
        await db.collection('nav-role-access').insertOne({ organization: org._id, role, navKeys });
        created++;
      }
    }
  }
  console.log(`Organizations: ${orgs.length}, default role-access docs created: ${created}`);

  await mongoose.disconnect();
  console.log('Done.');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
