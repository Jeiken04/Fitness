# DailyForm v26 — development foundation
1. Back up v25. In Supabase dailyform-dev, open SQL Editor, New query, paste supabase/001_foundation.sql and Run once. Expect success. If tables already exist, stop and inspect rather than deleting them.
2. Deploy the app files to the existing GitHub Pages origin (the supabase directory and Markdown instructions need not be published).
3. Close old app windows and reopen online. Settings → Cloud foundation → Test database connection. Expect schema v1.
4. Verify existing records and offline functionality. Test connection offline: failure should not affect local records.
5. In SQL Editor verify RLS is enabled on both tables and no anon/authenticated grants exist on dailyform_documents. No real data or accounts are created by this release.

The public probe exposes only a constant schema version. The document table is deliberately inaccessible to client roles. Domain-specific validation, authenticated ownership policies, conflict handling and migration are future work. Health data is excluded. Do not use this as a production security certification.
