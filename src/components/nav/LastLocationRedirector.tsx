import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export function LastLocationRedirector() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if user is at root or clients list
    if (location.pathname === "/" || location.pathname === "/clients") {
      const lastClientId = localStorage.getItem("nexus:lastClientId");
      if (lastClientId) {
        navigate(`/clients/${lastClientId}`, { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return null;
}