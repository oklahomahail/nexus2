import React from "react";

export function DemoNavBanner() {
  if (sessionStorage.getItem("demoBannerDismissed") === "1") return null;
  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        zIndex: 30,
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "10px 12px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      }}
    >
      <strong>Demo mode</strong>
      <div style={{ marginTop: 4 }}>
        Start in <b>Clients</b> to create or select <b>Regional Food Bank</b>,
        then click <b>New Campaign</b>.
      </div>
      <div style={{ marginTop: 8, textAlign: "right" }}>
        <button
          onClick={() => sessionStorage.setItem("demoBannerDismissed", "1")}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
