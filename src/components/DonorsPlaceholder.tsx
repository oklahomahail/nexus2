// src/components/DonorsPlaceholder.tsx
import { Users } from "lucide-react";
import React from "react";

const DonorsPlaceholder: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          Donors Panel Coming Soon
        </h3>
        <p className="text-slate-400">
          The donors management panel is currently under development.
        </p>
      </div>
    </div>
  );
};

export default DonorsPlaceholder;
