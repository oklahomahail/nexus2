import React from "react";
import { useParams } from "react-router-dom";

export default function ClientReports() {
  const { clientId: _clientId } = useParams();

  const reports = [
    {
      id: 1,
      name: "Quarterly Fundraising Summary",
      date: "2025-03-15",
      type: "Fundraising",
    },
    {
      id: 2,
      name: "Donor Retention Analysis",
      date: "2025-03-10",
      type: "Analytics",
    },
    {
      id: 3,
      name: "Campaign Performance Report",
      date: "2025-03-05",
      type: "Campaign",
    },
  ];

  // Show empty state when no reports (for demo purposes, you can set reports = [])
  if (reports.length === 0) {
    return (
      <div className="p-6" data-tutorial-step="reports.panel">
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Reports</h1>
            <p className="text-gray-600">
              Generate and download detailed reports
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Generate New Report
          </button>
        </div>

        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No reports yet
            </h2>
            <p className="text-gray-600 mb-6">
              Generate your first report to track fundraising performance and
              donor insights.
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Generate Your First Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-tutorial-step="reports.panel">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Reports</h1>
          <p className="text-gray-600">
            Generate and download detailed reports
          </p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Generate New Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Fundraising Reports</h3>
          <p className="text-gray-600 text-sm mb-4">
            Revenue, donations, and goal tracking
          </p>
          <button className="w-full px-3 py-2 border rounded-md hover:bg-gray-50">
            Create Fundraising Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Donor Reports</h3>
          <p className="text-gray-600 text-sm mb-4">
            Donor analysis and segmentation
          </p>
          <button className="w-full px-3 py-2 border rounded-md hover:bg-gray-50">
            Create Donor Report
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">Campaign Reports</h3>
          <p className="text-gray-600 text-sm mb-4">
            Campaign performance and ROI
          </p>
          <button className="w-full px-3 py-2 border rounded-md hover:bg-gray-50">
            Create Campaign Report
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Reports</h3>
        </div>
        <div className="divide-y">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-6 flex justify-between items-center"
            >
              <div>
                <h4 className="font-medium">{report.name}</h4>
                <p className="text-sm text-gray-600">
                  Generated on {report.date}
                </p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                  {report.type}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50">
                  View
                </button>
                <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
