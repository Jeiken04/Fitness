# Phase 2.6C — Security and QA

Run `node --test tests/backup.test.cjs` and `node --check` on each root JS file. Eight backup tests cover valid legacy data, invalid formats, unsafe properties, malformed records, excessive nesting, successful writes and simulated quota failure rollback.

Before deployment export a real backup. On a separate test browser profile, restore a v21 backup, compare workouts, weight, nutrition, recipes, Apple Health and boxing data. Try invalid JSON and malformed backups; verify no data changes. Test all tabs, timer audio, Apple Health ZIP/XML import, export download and offline reload under the new Content Security Policy. Check browser console for CSP violations. Test iPhone and Android installed PWAs. Do not use your only copy of personal data for failure testing.

## Commercial security backlog
- Browser storage is not encrypted by this app; same-origin scripts and people with device access may read it. Backups are plain JSON. Keep backups private.
- Use a dedicated origin before commercial deployment; GitHub Pages project paths are not storage isolation boundaries.
- Before accounts: server-side authorization for every record, tenant isolation tests, secure sessions, deletion/export, retention policy, encrypted transport and storage, dependency review, incident response and independent security testing.
- CSP is a defense in depth, not a complete XSS audit. Inline styles remain allowed for charts and layout. HTTP security headers (including frame-ancestors) require hosting support.
- Backup validation is structural, not a full semantic schema for every nested record. Rollback is best effort and verified where possible; browser storage is not transactional. No live browser/device test or legal compliance certification performed.
