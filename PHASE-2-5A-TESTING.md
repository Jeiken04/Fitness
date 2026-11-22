# Phase 2.5A testing checklist

1. Back up DailyForm before deployment. Confirm existing Activity, Nutrition, and Meal Planner tabs still work.
2. Save two boxing sessions, reload, load one, edit it, save, and delete the other.
3. Start, pause, resume, skip, and reset the boxing studio timer; test zero rest and warmup.
4. Complete a short session (e.g. 2 rounds x 10 seconds) and save the completed workout.
5. Export a JSON backup; confirm `dailyform-boxing-studio-v1` exists in `storage`. Restore on a separate browser profile and check saved sessions.
6. Test the combination generator at all levels and focus types.
7. Verify original boxing timer, workout logging, Apple Health import, and grocery planning remain functional.
8. Test iPhone Safari and Android Chrome. Audio may not work when the phone is locked; keep app awake.

**Known limitation:** Completed studio sessions are stored separately from the legacy boxing journal and progress charts. To include them in existing charts, also log the workout in the original Boxing tracker. The next release can unify this history.
