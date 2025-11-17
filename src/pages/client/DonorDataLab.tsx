import React from "react";

import { NexusDonorDataLabPanel } from "@/panels/NexusDonorDataLabPanel";

/**
 * DonorDataLab Page
 *
 * Upload anonymized donor data, analyze giving patterns, and receive
 * actionable segmentation strategy including upgrade prospects,
 * monthly giving candidates, reactivation targets, and lookalike seeds.
 */
export default function DonorDataLab(): React.JSX.Element {
  return <NexusDonorDataLabPanel />;
}
