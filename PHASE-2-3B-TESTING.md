# Phase 2.3B — manual testing

1. Export a backup from your existing DailyForm installation before deploying.
2. In Nutrition, save calorie/protein/carbs/fat targets. Open Meal Planner; verify the targets summary.
3. Enable target matching and generate a 3-day plan; verify daily totals, portions and grocery amounts.
4. Change a meal portion from 1 to 1.5; verify daily nutrition and grocery quantities both change.
5. Enable vegetarian and dairy/gluten/nut ingredient exclusions, generate, inspect each recipe; confirm no recipe with recognized excluded ingredients is included.
6. Try restrictive combinations; app should report if a meal category has no matching recipes.
7. Swap a meal and check that dietary preferences remain enforced.
8. Refresh; confirm settings, pantry, custom recipes, and plan persist.
9. Test old v15.2 saved data, backup/restore, mobile tabs, offline reload, and installed PWA update.

Cautions: nutrition figures are approximate and not independently verified. No clinical allergy guarantees. The optimizer adjusts portion sizes within 0.5–2 servings per person and may not reach all targets.
