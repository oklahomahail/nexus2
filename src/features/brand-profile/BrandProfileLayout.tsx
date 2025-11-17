import React from "react";

export const BrandProfileLayout = ({ left, right }: { left: React.ReactNode; right: React.ReactNode }) => {
  return (
    <div className="w-full max-w-7xl mx-auto py-10 px-6">
      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7 mb-10 lg:mb-0">
          {left}
        </div>
        <div className="lg:col-span-5 lg:sticky lg:top-8">
          {right}
        </div>
      </div>
    </div>
  );
};
