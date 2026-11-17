# DailyForm Phase 2.0 — Nutrition & Body Composition

## Install
1. Export a JSON backup from v11 before updating.
2. Replace all files at your existing HTTPS site, including icons and sw.js.
3. Refresh the site; on Android, close and reopen the installed app if an older cached shell appears.
4. Existing workout, strength, boxing, cardio and weight records retain their original storage keys.

## New features
- Nutrition tab: personal daily calorie, protein, carbohydrate, fat and water targets.
- Food diary: manually log named meals with per-portion calorie and macro amounts, and delete entries.
- Water: +250 mL, +500 mL, −250 mL adjustments.
- Seven-day nutrition log summary for the selected date.
- Weight Loss tab: optional waist, hips, chest, arm and thigh measurements in centimeters, with history.
- All new information is saved locally under `dailyform-phase20-v1`, included in JSON backup and restore.

## Test checklist
- [ ] Save targets, refresh, verify they persist.
- [ ] Log two meals, verify totals, delete one, verify totals update.
- [ ] Log water, change selected date, verify separate daily totals.
- [ ] Save measurements for two dates, verify history and deletion.
- [ ] Export a backup and confirm the JSON contains `dailyform-phase20-v1`.
- [ ] On a spare browser profile, restore backup and verify nutrition and measurements.
- [ ] Verify strength, cardio, boxing, timers, history, weight and Android installation still work.
- [ ] Test offline after first successful online visit.

## Notes
- Food nutrition values are entered manually; there is no barcode scanner, nutrition database, automatic calorie estimation or grocery-ad integration in this release.
- Goals are user-configured and not medical recommendations.
- All data remains local to each browser/device; no cross-device sync.
- There is no progress photo upload in this version. Photos need a separate storage/backup design before launch.
- Browser/device and offline testing is still required; static syntax and archive checks do not replace it.
