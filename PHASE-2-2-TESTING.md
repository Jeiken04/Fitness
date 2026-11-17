# DailyForm Phase 2.2 — Ingredient-based meal planning

## Install
1. Export a JSON backup from v13 before replacing any files.
2. Upload **all** files and folders to the same GitHub Pages repository path.
3. Refresh the app; on Android reopen the installed app online once to update offline assets.

## Test
- Add chicken breast 500 g (Already have), rice 500 g (Already have), broccoli 200 g (Want to buy).
- Generate a 3-day plan for one person. Confirm the grocery list subtracts the ingredients marked Already have.
- Swap a meal. Verify the grocery list updates.
- Check an item, refresh, and verify the check persists.
- Change to vegetarian and generate; no chicken, turkey, tuna or salmon meals should appear.
- Test 2 people and verify quantities double.
- Export a backup, verify `dailyform-phase22-v1` is included, and test restore on a disposable browser profile.
- Confirm strength, cardio, boxing, nutrition diary, and weight history remain unchanged.

## Limitations
- Meal selection uses a curated offline recipe list and ingredient overlap, not AI or a live recipe database.
- Nutrition values are approximate per person and fixed recipe portions. **The generator does not yet optimize against calorie/macronutrient targets** or account for food allergies. Check recipe ingredients before preparing meals.
- Ingredient matching uses common name aliases and exact units (g, mL, each); no conversion between pieces and grams.
- Grocery list shows ingredient amounts, not retail package sizes, prices, or verified nutrition labels.
- Data stays in this browser's localStorage and does not sync across devices.
