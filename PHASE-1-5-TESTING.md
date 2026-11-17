# DailyForm Phase 1.5 — Cross-Platform Stability

## Before updating
1. Export a JSON backup in Settings from your current app. Keep the backup somewhere outside your browser.
2. Upload ALL files and the icons directory to the same HTTPS site path as v10.
3. Refresh the site (on desktop, use Ctrl+Shift+R). Android may need to close and reopen the installed app.

## Regression checklist
- Strength: add an exercise, enter a set, mark it complete, refresh. The Dashboard Strength checklist and History should show the session.
- Strength: mark all builder sets incomplete; a session automatically created by the builder should clear, but a manually logged session must not be deleted.
- Strength: manually log a session and edit sets; the builder must not overwrite the manual duration or notes.
- Strength: open Strength progression; completed detailed sets should appear. Imported legacy exercise summaries should not count twice.
- Cardio and Boxing: log sessions and journal details, refresh and confirm they remain.
- Timers: start, pause, resume, switch tabs, background the browser and return. Countdown should account for elapsed time. iOS may silence alerts while locked.
- Settings: export a JSON backup, import it on a separate browser/profile, verify records and planner. Never test restore over your only copy.
- Offline Android: load while online once, close and reopen offline. Test after returning online.
- iPhone and PC: verify navigation, historical logs, saved weights, and backup export.

## Important
DailyForm still stores data locally in each browser profile. Android/iPhone/PC do not sync automatically. Offline installation and notification/sound behavior must be verified on real devices.
