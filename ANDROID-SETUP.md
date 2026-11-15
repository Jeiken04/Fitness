# DailyForm v10 — Phase 1.4 Android PWA

## Deployment
Upload the contents of this ZIP to the **same HTTPS site and same path** as your current DailyForm. Replace the previous app files together, including the new `android.js`, `sw.js`, and `icons/` folder. Keep a backup of the previous ZIP.

**Important:** browser localStorage is tied to the site origin. Changing your domain, protocol, browser, or installation context can make prior records unavailable. Export a DailyForm JSON backup first (Settings → Export backup). Do not clear site data.

## Android install
1. Open the HTTPS DailyForm site in Chrome on Android while online.
2. Wait for the app to load. Visit Settings → Android installation.
3. Use the Install DailyForm button when offered, or Chrome menu → Install app / Add to Home screen.
4. Reopen from the home screen and test strength, cardio, boxing, and backup.
5. Turn on airplane mode and reopen the installed app to test offline availability. Data continues to be stored locally on the device.

## Compatibility
The Android-only registration is gated on Android user agents. The existing iPhone and PC app scripts, storage keys, and workout features remain unchanged. A service worker can affect caching on Android; test updates and offline use on a real device.

## Limitations
- HTTPS (or localhost) is required for offline installability; file:// won't work.
- A browser decides whether/when an install prompt appears.
- No cloud sync or automatic transfer of workouts between devices. Use backup/restore.
- Android background timers and audio can still be restricted by the OS.
- This is a browser-installed PWA, not a Google Play submission.
