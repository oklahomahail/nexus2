export {};

export const CampaignDetail = ({ campaign }: { campaign?: any }) => (
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-4">Campaign Details</h2>
    {campaign ? (
      <div>
        <h3 className="text-xl">{campaign.name}</h3>
        <p>{campaign.description}</p>
      </div>
    ) : (
      <p>Select a campaign to view details</p>
    )}
  </div>
);
