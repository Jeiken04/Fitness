# DailyForm Phase 2.6A — testing checklist

1. Export a JSON backup **before deploying**. Keep a copy outside the browser.
2. Deploy all files from this ZIP to the same GitHub Pages repository and refresh.
3. Settings → Storage health → Run storage check. Verify saved categories and JSON validity.
4. Export a new backup and confirm it contains `format: dailyform-backup`, `version: 1`, and your saved categories.
5. On a **separate test browser/profile**, import that backup and confirm the category preview appears before you approve the restore. Verify workouts, boxing mini-tabs, programs, meals and Apple Health activity.
6. Cancel a restore and verify nothing changes. Test an invalid JSON file and verify it is rejected.
7. Verify offline loading after a successful online visit, including on Android/iPhone if used.

Notes: Diagnostics are not a full database integrity audit; valid JSON can still contain inconsistent values. Browser data is device-local and does not sync. Restore replaces only the categories present in the backup. Automated checks do not substitute for live device testing.
