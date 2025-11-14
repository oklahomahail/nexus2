import { useParams, useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function ClientCampaigns() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const campaigns = [
    {
      id: "eoy-holiday-2025",
      name: "End-of-Year Holiday 2025",
      status: "Active",
      raised: "$45,230",
      goal: "$75,000",
      track15_enabled: true, // Example Track15 campaign
    },
  ];

  // Show empty state when no campaigns (for demo purposes, you can set campaigns = [])
  if (campaigns.length === 0) {
    return (
      <div className="p-6" data-tutorial-step="campaigns.page">
        <div className="flex justify-between mb-4">
          <h1 className="text-xl font-semibold">Campaigns</h1>
          <button
            className="px-3 py-1.5 border rounded-md bg-white"
            onClick={() => navigate(`/clients/${clientId}/campaigns/new`)}
            data-tutorial-step="campaigns.new"
          >
            New Campaign
          </button>
        </div>

        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No campaigns yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first campaign to start tracking performance and
              engaging donors.
            </p>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => navigate(`/clients/${clientId}/campaigns/new`)}
              data-tutorial-step="campaigns.new"
            >
              Create Your First Campaign
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-tutorial-step="campaigns.page">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Campaigns</h1>
        <button
          className="px-3 py-1.5 border rounded-md bg-white"
          onClick={() => navigate(`/clients/${clientId}/campaigns/new`)}
          data-tutorial-step="campaigns.new"
        >
          New Campaign
        </button>
      </div>

      <div
        className="bg-white rounded-lg border"
        data-tutorial-step="campaigns.list"
      >
        <table className="w-full">
          <thead className="border-b">
            <tr>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Status</th>
              <th className="text-left p-4">Progress</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {campaign.name}
                    {campaign.track15_enabled && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        title="Track15 Campaign"
                      >
                        <Sparkles className="w-3 h-3" />
                        Track15
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {campaign.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-sm">
                    <div>
                      {campaign.raised} / {campaign.goal}
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() =>
                        navigate(`/clients/${clientId}/campaigns/${campaign.id}`)
                      }
                      data-tutorial-step="campaigns.row"
                    >
                      Edit
                    </button>
                    {campaign.track15_enabled && (
                      <button
                        className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                        onClick={() =>
                          navigate(`/clients/${clientId}/track15?campaign=${campaign.id}`)
                        }
                        title="View Track15 Analytics"
                      >
                        Analytics
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
