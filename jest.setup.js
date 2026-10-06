// Runs before every test file (and before the test file's imports are
// evaluated), so module-level reads such as
// `const SECRET_KEY = process.env.SECRET_KEY!` pick these up.
process.env.SECRET_KEY = process.env.SECRET_KEY || 'test-secret-key';
