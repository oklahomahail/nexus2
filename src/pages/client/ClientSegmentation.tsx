import React, { useState } from "react";

import { NewSegmentModal } from "../../components/segments/NewSegmentModal";
import { SegmentationOverviewPanel } from "../../panels/SegmentationOverviewPanel";
import { BehavioralSegment } from "../../services/campaignComposer/defaultSegmentCatalog";

/**
 * ClientSegmentation Page
 *
 * Main page for segment management and analytics.
 * Shows all available segments, donor counts, engagement trends,
 * and allows creation of custom segments.
 */
export default function ClientSegmentation(): React.JSX.Element {
  const [_customSegments, setCustomSegments] = useState<BehavioralSegment[]>(
    [],
  );
  const [isNewSegmentModalOpen, setIsNewSegmentModalOpen] = useState(false);
  const [_selectedSegmentId, setSelectedSegmentId] = useState<string | null>(
    null,
  );

  const handleCreateSegment = () => {
    setIsNewSegmentModalOpen(true);
  };

  const handleSaveSegment = (segment: BehavioralSegment) => {
    setCustomSegments((prev) => [...prev, segment]);
    // In production, this would also save to Supabase
    console.log("Saving new segment:", segment);
  };

  const handleSelectSegment = (segmentId: string) => {
    setSelectedSegmentId(segmentId);
    // In production, this might navigate to a segment detail view
    console.log("Selected segment:", segmentId);
  };

  return (
    <div className="h-full">
      <SegmentationOverviewPanel
        onSelectSegment={handleSelectSegment}
        onCreateSegment={handleCreateSegment}
      />

      <NewSegmentModal
        isOpen={isNewSegmentModalOpen}
        onClose={() => setIsNewSegmentModalOpen(false)}
        onSave={handleSaveSegment}
      />
    </div>
  );
}
