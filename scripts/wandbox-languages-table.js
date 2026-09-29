/**
 * Single source of truth for the languages the platform curates from Wandbox.
 * Consumed by seed-wandbox-languages.js (DB seeding) and smoke-wandbox.js
 * (compile/run verification). Keep in sync with src/types/languageExecutionMap.ts.
 *
 * exec: whether Wandbox truly executes user code for this label. False for CPP
 * (a C++ duplicate that only preprocesses), OpenSSL (a shell wrapper around the
 * openssl CLI - no language runner) and eight languages whose every compiler
 * box is broken upstream as of 2026-09 (Elixir/Erlang/OCaml/Pony/Swift/Vim/
 * Crystal/Lazy K: sandbox exit codes 153/127/126/255 or catatonit/loader errors
 * on any input). They stay seeded (admin visibility) but are never offered or
 * run.
 */
'use strict';

const LANGUAGE_TABLE = [
  { canonicalKey: 'javascript', languageName: 'JavaScript', wandboxLabel: 'JavaScript', exec: true },
  { canonicalKey: 'python', languageName: 'Python', wandboxLabel: 'Python', exec: true },
  { canonicalKey: 'typescript', languageName: 'TypeScript', wandboxLabel: 'TypeScript', exec: true },
  { canonicalKey: 'java', languageName: 'Java', wandboxLabel: 'Java', exec: true },
  { canonicalKey: 'c', languageName: 'C', wandboxLabel: 'C', exec: true },
  { canonicalKey: 'c++', languageName: 'C++', wandboxLabel: 'C++', exec: true },
  { canonicalKey: 'go', languageName: 'Go', wandboxLabel: 'Go', exec: true },
  { canonicalKey: 'rust', languageName: 'Rust', wandboxLabel: 'Rust', exec: true },
  { canonicalKey: 'csharp', languageName: 'C#', wandboxLabel: 'C#', exec: true },
  { canonicalKey: 'ruby', languageName: 'Ruby', wandboxLabel: 'Ruby', exec: true },
  { canonicalKey: 'nim', languageName: 'Nim', wandboxLabel: 'Nim', exec: true },
  { canonicalKey: 'haskell', languageName: 'Haskell', wandboxLabel: 'Haskell', exec: true },
  { canonicalKey: 'erlang', languageName: 'Erlang', wandboxLabel: 'Erlang', exec: false },
  { canonicalKey: 'elixir', languageName: 'Elixir', wandboxLabel: 'Elixir', exec: false },
  { canonicalKey: 'd', languageName: 'D', wandboxLabel: 'D', exec: true },
  { canonicalKey: 'scala', languageName: 'Scala', wandboxLabel: 'Scala', exec: true },
  { canonicalKey: 'groovy', languageName: 'Groovy', wandboxLabel: 'Groovy', exec: true },
  { canonicalKey: 'swift', languageName: 'Swift', wandboxLabel: 'Swift', exec: false },
  { canonicalKey: 'perl', languageName: 'Perl', wandboxLabel: 'Perl', exec: true },
  { canonicalKey: 'php', languageName: 'PHP', wandboxLabel: 'PHP', exec: true },
  { canonicalKey: 'lua', languageName: 'Lua', wandboxLabel: 'Lua', exec: true },
  { canonicalKey: 'sql', languageName: 'SQL', wandboxLabel: 'SQL', exec: true },
  { canonicalKey: 'pascal', languageName: 'Pascal', wandboxLabel: 'Pascal', exec: true },
  { canonicalKey: 'lisp', languageName: 'Lisp', wandboxLabel: 'Lisp', exec: true },
  { canonicalKey: 'ocaml', languageName: 'OCaml', wandboxLabel: 'OCaml', exec: false },
  { canonicalKey: 'bash', languageName: 'Bash script', wandboxLabel: 'Bash script', exec: true },
  { canonicalKey: 'pony', languageName: 'Pony', wandboxLabel: 'Pony', exec: false },
  { canonicalKey: 'crystal', languageName: 'Crystal', wandboxLabel: 'Crystal', exec: false },
  { canonicalKey: 'r', languageName: 'R', wandboxLabel: 'R', exec: true },
  { canonicalKey: 'julia', languageName: 'Julia', wandboxLabel: 'Julia', exec: true },
  { canonicalKey: 'zig', languageName: 'Zig', wandboxLabel: 'Zig', exec: true },
  { canonicalKey: 'vimscript', languageName: 'Vim script', wandboxLabel: 'Vim script', exec: false },
  { canonicalKey: 'lazyk', languageName: 'Lazy K', wandboxLabel: 'Lazy K', exec: false },
  // Stored but NOT exposed (see header comment).
  { canonicalKey: 'cpp-preprocessor', languageName: 'CPP', wandboxLabel: 'CPP', exec: false },
  { canonicalKey: 'openssl', languageName: 'OpenSSL', wandboxLabel: 'OpenSSL', exec: false }
];

module.exports = { LANGUAGE_TABLE };