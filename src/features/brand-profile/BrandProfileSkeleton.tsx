import { BrandProfileLayout } from "./BrandProfileLayout";

const SkeletonBox = ({ height = "h-10" }: { height?: string }) => (
  <div className={`${height} bg-gray-200 rounded-md animate-pulse`} />
);

const FormSkeleton = () => (
  <div className="space-y-10">
    {/* Page Title */}
    <div>
      <SkeletonBox height="h-8" />
      <div className="mt-4 space-y-2">
        <SkeletonBox height="h-4" />
        <SkeletonBox height="h-4" />
      </div>
    </div>

    {/* Brand Name */}
    <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
      <SkeletonBox height="h-4" />
      <div className="mt-2">
        <SkeletonBox height="h-10" />
      </div>
    </div>

    {/* Mission Statement */}
    <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
      <SkeletonBox height="h-4" />
      <div className="mt-2">
        <SkeletonBox height="h-32" />
      </div>
    </div>

    {/* Guidelines URL */}
    <div className="bg-white border border-gray-200 rounded-md p-6 shadow-sm">
      <SkeletonBox height="h-4" />
      <div className="mt-2">
        <SkeletonBox height="h-10" />
      </div>
    </div>
  </div>
);

const PreviewSkeleton = () => (
  <div className="bg-[#FAFAF8] border border-gray-300 rounded-md p-6 shadow-sm">
    <SkeletonBox height="h-6" />
    <div className="mt-6 space-y-6">
      <div>
        <SkeletonBox height="h-4" />
        <div className="mt-2">
          <SkeletonBox height="h-6" />
        </div>
      </div>
      <div>
        <SkeletonBox height="h-4" />
        <div className="mt-2 space-y-2">
          <SkeletonBox height="h-4" />
          <SkeletonBox height="h-4" />
          <SkeletonBox height="h-4" />
        </div>
      </div>
    </div>
  </div>
);

export const BrandProfileSkeleton = () => {
  return (
    <BrandProfileLayout left={<FormSkeleton />} right={<PreviewSkeleton />} />
  );
};
