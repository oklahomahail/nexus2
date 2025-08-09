// src/context/analytics/AnalyticsContext.tsx

export {};

export {};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context)
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  return context;
};

export const AnalyticsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => <div>{children}</div>;
