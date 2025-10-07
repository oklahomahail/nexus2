import { useParams } from "react-router-dom";

export default function ClientDashboard() {
  const { clientId } = useParams();

  return (
    <div className="p-6" data-tutorial-step="dashboard.page">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2 text-slate-900">
          Dashboard
        </h1>
        <p className="text-slate-600">
          Welcome to{" "}
          {clientId
            ?.replace(/-/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
          dashboard
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        data-tutorial-step="dashboard.performance"
      >
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-600 mb-2">
            Total Raised
          </h3>
          <p className="text-2xl font-bold text-emerald-600">$127,450</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-600 mb-2">
            Active Campaigns
          </h3>
          <p className="text-2xl font-bold text-slate-900">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-600 mb-2">Donors</h3>
          <p className="text-2xl font-bold text-slate-900">1,248</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-sm font-medium text-slate-600 mb-2">
            Conversion Rate
          </h3>
          <p className="text-2xl font-bold text-blue-600">3.2%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-sm text-slate-800">
                New donation received
              </span>
              <span className="text-xs text-slate-500">2 hours ago</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-sm text-slate-800">Campaign launched</span>
              <span className="text-xs text-slate-500">1 day ago</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-800">Report generated</span>
              <span className="text-xs text-slate-500">3 days ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-900">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-medium transition-colors">
              Create New Campaign
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-medium transition-colors">
              Generate Report
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-medium transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
