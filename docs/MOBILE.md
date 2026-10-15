# KINEZIS LIVE on iOS and Android

The app is server-rendered, so the native apps are thin shells (Capacitor) that load the hosted web app.
One deployment serves the website, the iPhone app and the Android app.

## 1. Deploy the web app (Vercel, free)

1. Sign in at https://vercel.com with GitHub and click **Add New → Project**, pick `kinezis-live`.
2. Framework: Next.js (detected). Add Environment Variables:
   - `NEXT_PUBLIC_SITE_URL` = `https://<your-project>.vercel.app`
   - `NEXT_PUBLIC_SUPABASE_URL` = same as in `.env.local`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = same as in `.env.local`
3. Deploy. Every `git push` to `main` redeploys automatically.
4. In Supabase → Authentication → URL Configuration add `https://<your-project>.vercel.app/**` to Redirect URLs
   and set Site URL to the deployment. Re-enable **Confirm email** before launch.

## 2. Point the shells at the deployment

`capacitor.config.ts` reads `CAPACITOR_SERVER_URL`; the default is `https://kinezis-live.vercel.app`.
Set it to your real URL when it differs:

```bash
CAPACITOR_SERVER_URL=https://<your-project>.vercel.app npm run cap:sync
```

For testing on a phone in the same Wi-Fi without deploying, point at the dev server
(`ipconfig getifaddr en0` shows your Mac's IP):

```bash
CAPACITOR_SERVER_URL=http://192.168.x.x:3001 npm run cap:sync
```

## 3. iOS

- Install Xcode from the App Store, open it once and accept the licence.
- `npm run cap:ios` opens `ios/App/App.xcodeproj`. Select the App target → Signing & Capabilities → pick your Apple ID team.
- Connect an iPhone, choose it as the run destination and press Run.
- Publishing needs the Apple Developer Program (99 USD/year): Product → Archive → Distribute.

## 4. Android

- Install Android Studio. On first launch let it install the SDK.
- `npm run cap:android` opens the `android` folder. Press Run with a connected phone or an emulator.
- Publishing needs a Google Play Console account (25 USD once): Build → Generate Signed Bundle.

## 5. Icons and splash

Sources live in `mobile/assets/` (icon, adaptive foreground/background, splash). Regenerate after changing them:

```bash
npx @capacitor/assets generate --assetPath mobile/assets --iconBackgroundColor '#10242b' --splashBackgroundColor '#10242b'
```

## Known limits of the shell approach

- Email confirmation links open in the phone browser, not inside the app. Universal links can fix this later.
- The app needs internet; `mobile/www/index.html` is only the offline placeholder.
- Store review requires a privacy policy URL: use `https://kinezis-live.vercel.app/privacy` (terms: `/terms`). Subscriptions need in-app purchases instead of web payments.
