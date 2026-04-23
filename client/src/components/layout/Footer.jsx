const Footer = () => {
  const isMobile = window.innerWidth <= 768;
  return (
    <footer
      style={{
        background: "#1a1a2e",
        color: "#aaa",
        textAlign: "center",
        padding: isMobile ? "1.5rem 1rem 5rem" : "2rem",
        marginTop: "1rem",
      }}
    >
      <p>🏏 CricketGear © 2026 — All Rights Reserved</p>
      <p style={{ marginTop: "8px", fontSize: "14px" }}>
        Built with MERN Stack
      </p>
    </footer>
  );
};
export default Footer;
