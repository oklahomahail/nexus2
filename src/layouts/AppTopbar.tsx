/**
 * AppTopbar Component
 * Premium editorial topbar with consistent navigation and user actions
 */

import Button from "@/components/ui-kit/Button";

export default function AppTopbar() {
  return (
    <header className="h-16 border-b border-[var(--nx-border)] bg-[var(--nx-offwhite)] flex items-center px-6 justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <h1 className="text-[18px] font-semibold text-[var(--nx-charcoal)] tracking-tight">
          Nexus
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm">
          Support
        </Button>
        <Button variant="ghost" size="sm">
          Docs
        </Button>

        {/* Future: profile dropdown */}
        <div className="w-8 h-8 rounded-full bg-gray-300" />
      </div>
    </header>
  );
}
