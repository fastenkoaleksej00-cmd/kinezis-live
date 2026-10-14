import type { CapacitorConfig } from "@capacitor/cli";

/**
 * KINEZIS LIVE native shell.
 * The app is server-rendered (Next.js), so the iOS/Android shells load the hosted web app
 * instead of bundling static files. Point CAPACITOR_SERVER_URL at a deployment or, for
 * testing on a phone in the same Wi-Fi, at the dev server, e.g. http://192.168.1.20:3001.
 */
const serverUrl = process.env.CAPACITOR_SERVER_URL?.trim() || "https://kinezis-live.vercel.app";

const config: CapacitorConfig = {
  appId: "com.kinezis.live",
  appName: "KINEZIS LIVE",
  webDir: "mobile/www",
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith("http://"),
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#f5f8f8",
  },
  android: {
    backgroundColor: "#f5f8f8",
  },
  plugins: {
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#f5f8f8",
    },
  },
};

export default config;
