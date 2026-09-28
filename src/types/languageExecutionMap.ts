/**
 * Bridges the friendly language names used by the LMS (e.g. 'JavaScript',
 * 'Python') to canonical runtime keys understood by the execution pipeline.
 * Spans every language Wandbox can execute (35 labels) plus the aliases users
 * might type.
 *
 * Three layers:
 *   LANGUAGE_MAP       - alias (user input)  -> canonicalKey
 *   LANGUAGE_REGISTRY  - canonicalKey        -> display name / Wandbox label /
 *                        execability. This is the whitelist that decides what
 *                        may be executed; anything not listed is rejected.
 *   LANGUAGE_FILE_EXTENSIONS - file extension per canonical key.
 * Starter boilerplate is NOT hardcoded: it is fetched live from Wandbox's
 * template endpoint for every language (see getWandboxStarter), falling back
 * to a writer-supplied starter when present.
 */

export interface ILanguageRegistryEntry {
    displayName: string;
    /** Exact `language` value in Wandbox's list.json used to pick a compiler. */
    wandboxLabel: string;
    /** Whether Wandbox actually executes user code for this entry. */
    isExecutable: boolean;
}

export const LANGUAGE_REGISTRY: Record<string, ILanguageRegistryEntry> = {
    javascript: { displayName: 'JavaScript', wandboxLabel: 'JavaScript', isExecutable: true },
    python: { displayName: 'Python', wandboxLabel: 'Python', isExecutable: true },
    typescript: { displayName: 'TypeScript', wandboxLabel: 'TypeScript', isExecutable: true },
    java: { displayName: 'Java', wandboxLabel: 'Java', isExecutable: true },
    c: { displayName: 'C', wandboxLabel: 'C', isExecutable: true },
    'c++': { displayName: 'C++', wandboxLabel: 'C++', isExecutable: true },
    go: { displayName: 'Go', wandboxLabel: 'Go', isExecutable: true },
    rust: { displayName: 'Rust', wandboxLabel: 'Rust', isExecutable: true },
    csharp: { displayName: 'C#', wandboxLabel: 'C#', isExecutable: true },
    ruby: { displayName: 'Ruby', wandboxLabel: 'Ruby', isExecutable: true },
    nim: { displayName: 'Nim', wandboxLabel: 'Nim', isExecutable: true },
    haskell: { displayName: 'Haskell', wandboxLabel: 'Haskell', isExecutable: true },
    erlang: { displayName: 'Erlang', wandboxLabel: 'Erlang', isExecutable: false },
    elixir: { displayName: 'Elixir', wandboxLabel: 'Elixir', isExecutable: false },
    d: { displayName: 'D', wandboxLabel: 'D', isExecutable: true },
    scala: { displayName: 'Scala', wandboxLabel: 'Scala', isExecutable: true },
    groovy: { displayName: 'Groovy', wandboxLabel: 'Groovy', isExecutable: true },
    swift: { displayName: 'Swift', wandboxLabel: 'Swift', isExecutable: false },
    perl: { displayName: 'Perl', wandboxLabel: 'Perl', isExecutable: true },
    php: { displayName: 'PHP', wandboxLabel: 'PHP', isExecutable: true },
    lua: { displayName: 'Lua', wandboxLabel: 'Lua', isExecutable: true },
    sql: { displayName: 'SQL', wandboxLabel: 'SQL', isExecutable: true },
    pascal: { displayName: 'Pascal', wandboxLabel: 'Pascal', isExecutable: true },
    lisp: { displayName: 'Lisp', wandboxLabel: 'Lisp', isExecutable: true },
    ocaml: { displayName: 'OCaml', wandboxLabel: 'OCaml', isExecutable: false },
    bash: { displayName: 'Bash script', wandboxLabel: 'Bash script', isExecutable: true },
    pony: { displayName: 'Pony', wandboxLabel: 'Pony', isExecutable: false },
    crystal: { displayName: 'Crystal', wandboxLabel: 'Crystal', isExecutable: false },
    r: { displayName: 'R', wandboxLabel: 'R', isExecutable: true },
    julia: { displayName: 'Julia', wandboxLabel: 'Julia', isExecutable: true },
    zig: { displayName: 'Zig', wandboxLabel: 'Zig', isExecutable: true },
    vimscript: { displayName: 'Vim script', wandboxLabel: 'Vim script', isExecutable: false },
    lazyk: { displayName: 'Lazy K', wandboxLabel: 'Lazy K', isExecutable: false },
    // Present in Wandbox's list but NOT executed as a language:
    //   CPP - a C++ duplicate that only preprocesses; OpenSSL - a shell
    //   wrapper around the openssl CLI. Plus Elixir/Erlang/OCaml/Pony/Swift/
    //   Vim script/Crystal/Lazy K whose every Wandbox box is broken upstream
    //   (sandbox exit 153/127/126/255 or catatonit/loader errors on any code).
    //   They stay registered so the seed keeps them discoverable, but the
    //   execution pipeline and the fallback list skip them.
    'cpp-preprocessor': { displayName: 'CPP', wandboxLabel: 'CPP', isExecutable: false },
    openssl: { displayName: 'OpenSSL', wandboxLabel: 'OpenSSL', isExecutable: false }
};

/**
 * Alias map: anything a user might type -> canonical key. The canonical keys of
 * the original six languages are unchanged so existing data keeps resolving.
 */
export const LANGUAGE_MAP: Record<string, string> = {
    javascript: 'javascript',
    js: 'javascript',
    node: 'javascript',
    nodejs: 'javascript',
    python: 'python',
    python3: 'python',
    py: 'python',
    typescript: 'typescript',
    ts: 'typescript',
    java: 'java',
    c: 'c',
    cpp: 'c++',
    'c++': 'c++',
    'c#': 'csharp',
    csharp: 'csharp',
    cs: 'csharp',
    go: 'go',
    golang: 'go',
    rust: 'rust',
    ruby: 'ruby',
    rb: 'ruby',
    swift: 'swift',
    php: 'php',
    lua: 'lua',
    sql: 'sql',
    sqlite: 'sql',
    perl: 'perl',
    pl: 'perl',
    scala: 'scala',
    groovy: 'groovy',
    nim: 'nim',
    haskell: 'haskell',
    hs: 'haskell',
    erlang: 'erlang',
    elixir: 'elixir',
    ex: 'elixir',
    exs: 'elixir',
    d: 'd',
    dlang: 'd',
    pascal: 'pascal',
    fpc: 'pascal',
    lisp: 'lisp',
    clisp: 'lisp',
    commonlisp: 'lisp',
    ocaml: 'ocaml',
    bash: 'bash',
    shell: 'bash',
    sh: 'bash',
    'bash script': 'bash',
    'bash-script': 'bash',
    pony: 'pony',
    crystal: 'crystal',
    cr: 'crystal',
    r: 'r',
    rlang: 'r',
    julia: 'julia',
    jl: 'julia',
    zig: 'zig',
    vimscript: 'vimscript',
    vim: 'vimscript',
    'vim script': 'vimscript',
    'vim-script': 'vimscript',
    lazyk: 'lazyk',
    'lazy-k': 'lazyk',
    'lazy k': 'lazyk'
};

export const LANGUAGE_FILE_EXTENSIONS: Record<string, string> = {
    javascript: 'js',
    python: 'py',
    typescript: 'ts',
    java: 'java',
    c: 'c',
    'c++': 'cpp'
};