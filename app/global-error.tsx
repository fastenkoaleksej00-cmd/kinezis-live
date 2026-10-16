"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", background: "#eef7f4", color: "#10242b", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 22 }}>KINEZIS LIVE</h1>
          <p style={{ color: "#4f6f68" }}>Something went wrong. Please try again.</p>
          <button onClick={reset} style={{ marginTop: 12, padding: "12px 20px", borderRadius: 999, border: 0, background: "#2f7d70", color: "#fff", fontWeight: 600 }}>
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
