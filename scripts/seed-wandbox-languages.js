/**
 * Seeds the programming-languages collection with every language Wandbox can
 * execute (currently 35 labels), storing the stable mapping the app relies on:
 *
 *   canonicalKey  - the app's internal slug (unique). Execution, test-case
 *                   generation and starter-code resolution key off this.
 *   languageName  - the display name shown in the employee language picker.
 *   wandboxLabel  - the exact `language` field value from Wandbox's list.json;
 *                   used to resolve the newest compiler at request time (never
 *                   store compiler names - they are added/removed constantly).
 *   isActive      - shown in the picker.
 *   isExecutable  - actually executes code on Wandbox.
 *
 * Two Wandbox labels are deliberately stored but deactivated because they do
 * NOT execute user code like a normal language:
 *   - CPP           is a duplicate of C++ that only runs the C preprocessor
 *                   (no program!) - clang-head-pp emits preprocessed source.
 *   - OpenSSL       is a shell wrapper around the `openssl` CLI, not a
 *                   language runner (submitting arbitrary input returns
 *                   "command not found").
 *
 * Idempotent - safe to re-run. Upserts by canonicalKey, backfills canonicalKey
 * on legacy docs that predate this schema, and warns when the live Wandbox list
 * has dropped a seeded label or gained a new one.
 *
 * IMPORTANT: run this BEFORE starting the server for an existing database, so
 * the unique canonicalKey index is built over documents that already have the
 * field (the script backfills it first).
 *
 * Run:  node scripts/seed-wandbox-languages.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const { LANGUAGE_TABLE } = require('./wandbox-languages-table');

const WANDBOX_LIST_URL = 'https://wandbox.org/api/list.json';

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

(async () => {
  let liveLabels = null;
  try {
    const response = await fetch(WANDBOX_LIST_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const list = await response.json();
    liveLabels = new Set((list || []).map((c) => String(c.language || '')));
    console.log(`Live Wandbox labels: ${liveLabels.size}`);
  } catch (error) {
    console.warn(`Could not fetch ${WANDBOX_LIST_URL} (${error.message}); seeding from the static table only.`);
  }

  await mongoose.connect(process.env.DB_CONNECTION_STRING, { dbName: process.env.DB_NAME });
  const db = mongoose.connection.db;

  const byKey = new Map(LANGUAGE_TABLE.map((l) => [l.canonicalKey, l]));
  const byName = new Map(LANGUAGE_TABLE.map((l) => [l.languageName.toLowerCase(), l]));

  // 1) Backfill canonicalKey on legacy docs so the unique index can build.
  const existing = await db.collection('programming-languages').find({}).toArray();
  let backfilled = 0;
  for (const doc of existing) {
    if (doc.canonicalKey) continue;
    const name = String(doc.languageName || '');
    const tableEntry = byName.get(name.trim().toLowerCase());
    const canonicalKey = (tableEntry && tableEntry.canonicalKey) || slugify(name);
    await db.collection('programming-languages').updateOne(
      { _id: doc._id },
      { $set: {
          canonicalKey,
          wandboxLabel: (tableEntry && tableEntry.wandboxLabel) || name.trim(),
          isActive: true,
          isExecutable: (tableEntry && tableEntry.exec) || true,
          displayOrder: (doc.displayOrder !== undefined) ? doc.displayOrder : 0
        } }
    );
    backfilled++;
  }
  console.log(`Legacy docs backfilled: ${backfilled}`);

  // 2) Upsert the full table by canonicalKey. Order preserved so existing docs
  //    found by languageName keep their _id (stable CodeRun languageId refs).
  for (let i = 0; i < LANGUAGE_TABLE.length; i++) {
    const lang = LANGUAGE_TABLE[i];
    const match = existing.find((doc) =>
      !doc.canonicalKey &&
      String(doc.languageName || '').trim().toLowerCase() === lang.languageName.toLowerCase()
    );
    const filter = match ? { _id: match._id } : { canonicalKey: lang.canonicalKey };
    await db.collection('programming-languages').updateOne(
      filter,
      { $set: {
          canonicalKey: lang.canonicalKey,
          languageName: lang.languageName,
          wandboxLabel: lang.wandboxLabel,
          isActive: lang.exec,
          isExecutable: lang.exec,
          displayOrder: (i + 1) * 10
        } },
      { upsert: true }
    );
  }
  console.log(`Languages upserted: ${LANGUAGE_TABLE.length}`);

  // 3) Demote legacy languages that are NOT in the table (no Wandbox backing,
  //    e.g. Kotlin in the original LMS). The doc is kept - CodeRun history
  //    references its _id - but it can never run, so it must not be offered or
  //    executed. The admin can re-add any Wandbox language with the CRUD API
  //    (new fields canonicalKey/wandboxLabel/isActive/isExecutable/displayOrder).
  //    Re-read the collection because backfill (step 1) wrote canonicalKey to
  //    the DB but the in-memory `existing` snapshot predates it.
  const tableKeys = new Set(LANGUAGE_TABLE.map((l) => l.canonicalKey));
  const settled = await db.collection('programming-languages').find({}).toArray();
  let demoted = 0;
  for (const doc of settled) {
    if (!tableKeys.has(doc.canonicalKey) && (doc.isActive || doc.isExecutable)) {
      await db.collection('programming-languages').updateOne(
        { _id: doc._id },
        { $set: { isActive: false, isExecutable: false } }
      );
      demoted++;
    }
  }
  if (demoted > 0) {
    console.log(`Language docs demoted (no Wandbox compiler): ${demoted}`);
  }

  // 4) Cross-check against the live Wandbox list (informational only).
  if (liveLabels) {
    const seeded = new Set(LANGUAGE_TABLE.map((l) => l.wandboxLabel));
    const dropped = [...seeded].filter((label) => !liveLabels.has(label));
    const added = [...liveLabels].filter((label) => !seeded.has(label));
    if (dropped.length) console.warn(`In table but missing from live Wandbox (compiler may be gone): ${dropped.join(', ')}`);
    if (added.length) console.warn(`On live Wandbox but not seeded (add to LANGUAGE_TABLE to expose): ${added.join(', ')}`);
    if (!dropped.length && !added.length) console.log('Table matches live Wandbox language list.');
  }

  await mongoose.disconnect();
  console.log('Done.');
})().catch((error) => { console.error('ERR', error.message); process.exit(1); });