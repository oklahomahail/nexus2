// src/components/Breadcrumb.tsx
import { ChevronRight, Home } from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";

import { useClient } from "@/context/ClientContext";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  const location = useLocation();
  const { currentClient } = useClient();

  // Auto-generate breadcrumbs based on current route if no items provided
  const breadcrumbItems =
    items || generateBreadcrumbs(location.pathname, currentClient);

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumb for single items
  }

  return (
    <nav
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <Link
        to="/clients"
        className="text-slate-400 hover:text-white transition-colors flex items-center"
      >
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-slate-500" />

          {item.href && !item.isActive ? (
            <Link
              to={item.href}
              className="text-slate-400 hover:text-white transition-colors truncate max-w-32"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={`truncate max-w-32 ${
                item.isActive ? "text-white font-medium" : "text-slate-400"
              }`}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

// Helper function to generate breadcrumbs from pathname
function generateBreadcrumbs(
  pathname: string,
  currentClient?: any,
): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const items: BreadcrumbItem[] = [];

  if (segments.length === 0) {
    return [];
  }

  // Handle different route patterns
  if (segments[0] === "clients") {
    items.push({ label: "Clients", href: "/clients" });
    return items;
  }

  if (segments[0] === "client" && segments[1]) {
    const clientId = segments[1];
    const clientName = currentClient?.name || `Client ${clientId}`;

    items.push({ label: "Clients", href: "/clients" });
    items.push({
      label: clientName,
      href: `/client/${clientId}`,
      isActive: segments.length === 2,
    });

    // Handle client sub-routes
    if (segments.length > 2) {
      const subRoute = segments[2];
      switch (subRoute) {
        case "campaigns":
          items.push({
            label: "Campaigns",
            href: `/client/${clientId}/campaigns`,
            isActive: segments.length === 3,
          });

          if (segments[3]) {
            items.push({
              label: `Campaign ${segments[3]}`,
              isActive: true,
            });
          }
          break;

        case "analytics":
          items.push({
            label: "Analytics",
            isActive: true,
          });
          break;

        default:
          items.push({
            label: capitalize(subRoute),
            isActive: true,
          });
      }
    }
  }

  // Handle global routes
  else if (segments[0] === "dashboard") {
    items.push({ label: "Dashboard", isActive: true });
  } else if (segments[0] === "campaigns") {
    items.push({ label: "Campaigns", isActive: true });
  } else if (segments[0] === "analytics") {
    items.push({ label: "Analytics", isActive: true });
  } else if (segments[0] === "donors") {
    items.push({ label: "Donors", isActive: true });
  }

  return items;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default Breadcrumb;
