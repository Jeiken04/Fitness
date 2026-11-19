# Phase 2.4.5 — Apple Health import

1. Back up DailyForm before updating.
2. Open Activity tab. On iPhone: Health → profile → Export All Health Data. Select ZIP or extract `apple_health_export/export.xml` and select XML.
3. Confirm steps, active calories, exercise minutes, walking/running distance, average heart rate and workouts display.
4. Re-import same file: data should replace, not double-count.
5. Export DailyForm JSON backup and restore it; imported activity should persist.
6. Verify existing workouts, pantry and nutrition tabs are unaffected.
7. Try on iPhone Safari, Windows Chrome and Android Chrome. Browser ZIP decompression varies; XML fallback is available.

Privacy: parsing occurs in the browser. The app retains daily aggregates and workout summaries, not the original export. No automatic Apple Watch syncing. Very large XML exports may exhaust device memory.
