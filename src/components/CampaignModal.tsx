// src/components/CampaignModal.tsx - Modernized with unified dark theme

export {};

export const CampaignModal = ({ 
  isOpen, 
  onClose, 
  initialData, 
  mode 
}: { 
  isOpen?: boolean; 
  onClose?: () => void; 
  initialData?: any; 
  mode?: string;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">
          {mode === "create" ? "Create Campaign" : "Edit Campaign"}
        </h2>
        <p className="mb-4">Campaign modal placeholder</p>
        <button 
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};
