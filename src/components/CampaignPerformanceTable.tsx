import React from "react";

interface CampaignPerformanceTableProps {
  campaigns: any[];
}

const CampaignPerformanceTable: React.FC<CampaignPerformanceTableProps> = ({
  campaigns,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border border-gray-200 rounded-lg">
        <thead className="bg-gray-100 text-sm text-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">Campaign</th>
            <th className="px-4 py-2 text-left">Donors</th>
            <th className="px-4 py-2 text-left">Raised</th>
            <th className="px-4 py-2 text-left">ROI</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-800">
          {campaigns.map((c: any) => (
            <tr key={c.id} className="border-t border-gray-200">
              <td className="px-4 py-2">{c.name}</td>
              <td className="px-4 py-2">{c.totalDonors}</td>
              <td className="px-4 py-2">
                ${(c.totalRevenue || 0).toLocaleString()}
              </td>
              <td className="px-4 py-2">{c.roi}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CampaignPerformanceTable;
