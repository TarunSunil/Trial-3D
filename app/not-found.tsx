export default function NotFound() {
  return (
    <main style={{ minHeight: "100svh", display: "grid", placeItems: "center", textAlign: "center", padding: "40px" }}>
      <div>
        <p className="eyebrow">404</p>
        <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", letterSpacing: "-0.06em", margin: "0 0 16px", fontWeight: 500 }}>This page drifted off the map.</h1>
        <p style={{ color: "var(--muted)", marginBottom: "28px" }}>The link may be old, or the page never existed.</p>
        <a href="/" style={{ display: "inline-block", border: "1px solid var(--line)", borderRadius: "999px", padding: "14px 19px", fontWeight: 600, textDecoration: "none" }}>Back to the portfolio</a>
      </div>
    </main>
  );
}
