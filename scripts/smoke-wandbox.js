/**
 * Compile+run smoke test across every executable Wandbox language the platform
 * exposes. For each language it:
 *   1. resolves the newest stable compiler (same policy as executeCodeService),
 *   2. fetches that compiler's official hello-world template (same endpoint the
 *      dynamic starter uses - so it doubles as a starter check),
 *   3. submits the template to /api/compile.json and reports the result.
 *
 * Usage: node scripts/smoke-wandbox.js
 * Requires Node >= 18 (global fetch).
 */
'use strict';

const { LANGUAGE_TABLE } = require('./wandbox-languages-table');

const WANDBOX_LIST_URL = 'https://wandbox.org/api/list.json';
const WANDBOX_TEMPLATE_URL = 'https://wandbox.org/api/template/';
const WANDBOX_COMPILE_URL = 'https://wandbox.org/api/compile.json';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pickCompiler = (label, entries) => {
  let candidates = entries;
  if (label === 'Python') {
    candidates = candidates.filter((entry) => entry.name.includes('cpython'));
  }
  const preferences = {
    'C#': ['dotnetcore-6'],
    Scala: ['scala-3.3']
  }[label] || [];
  const stable = (a, b) => Number(a.name.includes('head')) - Number(b.name.includes('head'));
  const pref = (entry) => {
    const rank = preferences.findIndex((token) => entry.name.toLowerCase().includes(token));
    return rank === -1 ? preferences.length + 1 : rank;
  };
  const ver = (a, b) => String(b.version || '').localeCompare(String(a.version || ''), undefined, { numeric: true, sensitivity: 'base' });
  return [...candidates].sort((a, b) => stable(a, b) || pref(a) - pref(b) || ver(a, b))[0];
};

(async () => {
  const entries = LANGUAGE_TABLE.filter((entry) => entry.exec);

  const list = await fetch(WANDBOX_LIST_URL).then((res) => res.json());
  if (!Array.isArray(list)) {
    console.error('Failed to load Wandbox compiler list.');
    process.exit(1);
  }

  const results = [];
  for (const entry of entries) {
    const byLabel = list.filter((compiler) => compiler.language === entry.wandboxLabel);
    const chosen = pickCompiler(entry.wandboxLabel, byLabel);
    if (!chosen) {
      results.push({ language: entry.languageName, label: entry.wandboxLabel, status: 'NO_COMPILER' });
      console.log(`[NO_COMPILER ] ${entry.languageName} (${entry.wandboxLabel}) - no compiler on Wandbox`);
      continue;
    }

    let code = '';
    const templateName = chosen.templates?.[0];
    if (templateName) {
      try {
        const template = await fetch(`${WANDBOX_TEMPLATE_URL}${encodeURIComponent(templateName)}`).then((res) => res.json());
        code = template?.code || '';
      } catch (error) {
        code = '';
      }
    }
    if (!code) {
      results.push({ language: entry.languageName, label: entry.wandboxLabel, status: 'NO_TEMPLATE' });
      console.log(`[NO_TEMPLATE] ${entry.languageName} (${entry.wandboxLabel}) - no starter template`);
      continue;
    }

    const started = Date.now();
    let response;
    try {
      const res = await fetch(WANDBOX_COMPILE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ compiler: chosen.name, code, stdin: '' })
      });
      response = await res.json();
    } catch (error) {
      results.push({ language: entry.languageName, label: entry.wandboxLabel, status: 'HTTP_ERROR' });
      console.log(`[HTTP_ERROR ] ${entry.languageName} (${entry.wandboxLabel}) - ${error.message}`);
      continue;
    }

    const elapsed = Math.round((Date.now() - started) / 1000);
    let status = 'COMPILATION_OR_RUN_ERROR';
    if (response.status === '0' && !response.compilation_error) {
      status = 'COMPLETED';
    } else if (response.compilation_error) {
      status = 'COMPILATION_ERROR';
      response.program_error = response.compilation_error;
    } else if (response.signal || (response.program_error && response.program_error.includes('timed out'))) {
      status = 'RUNTIME_ERROR_OR_TIMEOUT';
    }
    results.push({ language: entry.languageName, label: entry.wandboxLabel, status, elapsed, exit: response.exit_code, signal: response.signal });

    const tail = (String(response.program_error || response.stderr || '').trim().split('\n').slice(-1)[0] || '').slice(0, 90);
    console.log(`[${status.padEnd(18, ' ') }] ${entry.languageName.padEnd(14)} (${entry.wandboxLabel}) ${elapsed}s ${tail ? '| ' + tail : ''}`);

    await sleep(800);
  }

  const summary = {};
  for (const result of results) {
    summary[result.status] = (summary[result.status] || 0) + 1;
  }
  console.log('\n=== SUMMARY ===');
  for (const [status, count] of Object.entries(summary)) {
    console.log(`${status}: ${count}`);
  }
  if (summary.COMPLETED === results.length) {
    console.log('ALL LANGUAGES PASSED');
  }
  process.exit(summary.COMPLETED === results.length ? 0 : 1);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});