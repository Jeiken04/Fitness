# DailyForm Phase 2.3A — Test checklist

1. Export a backup before deploying. Upload all files to GitHub Pages.
2. Open Meal Planner and confirm existing pantry and plans still appear.
3. Add a pantry item in pounds with an expiration date; edit it; refresh and verify persistence.
4. Search the recipe library (56 built-in recipes).
5. Add a custom recipe with ingredients and total nutrition; regenerate and swap meals to test selection.
6. Verify grocery quantities are reduced by available pantry quantities, including lb conversion.
7. Add and check an extra grocery item, refresh and verify persistence.
8. Export a JSON backup; verify `dailyform-phase22-v1` contains customRecipes and extraGroceries. Restore on a test browser profile.
9. Verify Strength, Cardio, Boxing, Nutrition, timers, and Android installation still work.

**Limitations:** Built-in nutrition values are approximate illustrative estimates, not validated product nutrition. No allergy filtering or macro-target optimization until Phase 2.3B. Expiration dates are informational; expired items are not automatically excluded from grocery calculations.
