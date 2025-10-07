import React from "react";

export default function DemoBanner() {
  const show = new URLSearchParams(location.search).get("tour") === "1";
  
  if (!show) return null;
  
  return (
    <div className="fixed bottom-4 left-4 bg-white border rounded-md shadow px-3 py-2 text-sm z-40">
      Demo mode: start in <b>Clients</b> to pick <b>Regional Food Bank</b>, then open <b>Campaigns</b>.
    </div>
  );
}