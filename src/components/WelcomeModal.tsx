import { Play, Clock, X } from "lucide-react";
import React from "react";

import Modal from "@/components/ui-kit/Modal";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onStartTour: () => void;
  onRemindLater: () => void;
  onNeverShow: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  open,
  onClose,
  onStartTour,
  onRemindLater,
  onNeverShow,
}) => {
  return (
    <Modal open={open} onClose={onClose} maxWidth="md">
      <div className="relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close welcome modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center space-y-6 p-6 pt-12">
          {/* Logo/Icon */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">N</span>
          </div>

          {/* Welcome Message */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">
              Welcome to Nexus!
            </h2>
            <p className="text-slate-400 text-base max-w-md mx-auto">
              Your comprehensive nonprofit management platform. Let's get you started with a quick tour of the key features.
            </p>
          </div>

          {/* Tour Preview */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 text-left space-y-3">
            <h3 className="text-white font-semibold text-sm">
              This 2-minute tour will show you:
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span>How to navigate the main dashboard</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span>Creating and managing campaigns</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                <span>Viewing analytics and reports</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                <span>Managing donors and supporters</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onStartTour}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Start the Tour</span>
              <span className="text-blue-200 text-sm">(2 min)</span>
            </button>

            <div className="flex space-x-3">
              <button
                onClick={onRemindLater}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <Clock className="w-4 h-4" />
                <span>Remind Later</span>
              </button>

              <button
                onClick={onNeverShow}
                className="flex-1 bg-transparent border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Skip Forever
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-slate-500 space-y-1">
            <p>You can replay this tour anytime from the Help menu.</p>
            <p>Your tour preferences are saved locally on this device.</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default WelcomeModal;