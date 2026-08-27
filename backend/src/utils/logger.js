/**
 * Deliberately minimal — swap for pino/winston later if needed.
 * Never log check-in note plaintext, passwords, or raw tokens.
 */
function ts() {
  return new Date().toISOString();
}

module.exports = {
  info: (msg, meta = {}) => console.log(`[${ts()}] INFO  ${msg}`, meta),
  warn: (msg, meta = {}) => console.warn(`[${ts()}] WARN  ${msg}`, meta),
  error: (msg, meta = {}) => console.error(`[${ts()}] ERROR ${msg}`, meta),
};
