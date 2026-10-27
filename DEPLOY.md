# Deploy to Vercel with Neon

1. Create a Neon project and copy its connection string into `DATABASE_URL`.
2. Set `DATABASE_URL` locally in an uncommitted `.env` file before migrating.
3. Run `bun install` and `bun run db:migrate` to create the `app_state` table.
4. Push the project to the Git provider connected to your Vercel account.
5. Import the repository in Vercel and keep the Next.js build command as `bun run build`.
6. Add `DATABASE_URL` to the Vercel project environment variables for each deployment environment.
7. Set `APP_PASSWORD` to the single-user login password.
8. Set `AUTH_SECRET` to a long random secret used to sign the 30-day session cookie.
9. Redeploy after setting the environment variables; open `/login` and sign in.

Required environment variables: `DATABASE_URL`, `APP_PASSWORD`, and `AUTH_SECRET`. Keep `.env` out of Git; use `.env.example` as the variable-name reference.
