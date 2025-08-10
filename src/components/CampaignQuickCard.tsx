import React from "react";

import Card from "./ui-kit/Card";
import { Campaign } from "../models/campaign";

interface CampaignQuickCardProps {
  campaign: Campaign;
  onClick?: () => void;
  className?: string;
}

const CampaignQuickCard: React.FC<CampaignQuickCardProps> = ({
  campaign,
  onClick,
  className,
}) => {
  const progress =
    campaign.goal > 0 ? (campaign.raised / campaign.goal) * 100 : 0;

  return (
    <div
      className={`cursor-pointer hover:shadow-lg transition-shadow ${className || ""}`}
      onClick={onClick}
    >
      <Card>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-900 truncate">
              {campaign.name}
            </h3>
            {campaign.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {campaign.description}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{progress.toFixed(1)}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                ${campaign.raised.toLocaleString()} raised
              </span>
              <span className="text-gray-600">
                ${campaign.goal.toLocaleString()} goal
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                campaign.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : campaign.status === "Completed"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {campaign.status}
            </span>
            {campaign.endDate && (
              <span className="text-gray-500">
                Ends {new Date(campaign.endDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CampaignQuickCard;
