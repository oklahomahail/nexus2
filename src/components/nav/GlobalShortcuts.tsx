import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function GlobalShortcuts() {
  const navigate = useNavigate();
  const { clientId } = useParams();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      if (e.key === "g") {
        const next = (k: string) => {
          if (k === "c") navigate("/clients");
          if (!clientId) return;
          if (k === "d") navigate(`/clients/${clientId}`);
          if (k === "p") navigate(`/clients/${clientId}/campaigns`);
          if (k === "a") navigate(`/clients/${clientId}/analytics`);
          if (k === "r") navigate(`/clients/${clientId}/reports`);
        };
        const fn = (ev: KeyboardEvent) => { 
          window.removeEventListener("keydown", fn, true); 
          next(ev.key); 
        };
        window.addEventListener("keydown", fn, true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, clientId]);

  return null;
}