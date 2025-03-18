import { useState } from "react";

interface JoinGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinGroup: (groupCode: string) => void;
}

const JoinGroupModal = ({ isOpen, onClose, onJoinGroup }: JoinGroupModalProps) => {
  const [groupCode, setGroupCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupCode.trim()) {
      onJoinGroup(groupCode);
      setGroupCode("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="dashboard-card rounded-lg w-full max-w-md p-6 border border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Join a Group</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="groupCode" className="block text-sm font-medium text-gray-400 mb-1">
              Group Code
            </label>
            <input
              type="text"
              id="groupCode"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              placeholder="Enter the group code"
              required
            />
            <p className="mt-2 text-sm text-gray-500">
              The group code is provided by the group administrator.
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="dashboard-button px-4 py-2 rounded-md text-white"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 transition-colors text-white"
            >
              Join Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGroupModal; 