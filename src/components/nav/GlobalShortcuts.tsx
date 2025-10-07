import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function GlobalShortcuts() {
  const navigate = useNavigate();
  const { clientId } = useParams();

  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null) =>
      el instanceof HTMLElement &&
      el.closest(
        "input, textarea, [contenteditable=''], [contenteditable='true']",
      ) !== null;

    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return; // bail out if typing
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "g") {
        const next = (k: string) => {
          if (k === "c") void navigate("/clients");
          if (!clientId) return;
          if (k === "d") void navigate(`/clients/${clientId}`);
          if (k === "p") void navigate(`/clients/${clientId}/campaigns`);
          if (k === "a") void navigate(`/clients/${clientId}/analytics`);
          if (k === "r") void navigate(`/clients/${clientId}/reports`);
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
