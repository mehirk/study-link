import GroupDetails from "../components/dashboard/GroupDetails";
import GroupSidebar from "../components/dashboard/GroupSidebar";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  // Add debug logs
  console.log("Dashboard rendered with selectedGroup:", selectedGroup);

  // Log when selectedGroup changes
  useEffect(() => {
    console.log("selectedGroup state changed to:", selectedGroup);
  }, [selectedGroup]);

  const handleGroupSelect = (groupId: number | null) => {
    console.log("Group selected:", groupId);
    setSelectedGroup(groupId);
  };

  return (
    <div className="flex min-h-screens dashboard">
      <GroupSidebar onSelectGroup={handleGroupSelect} />

      {/* Main Content */}
      <div className="flex-1 p-4">
        {selectedGroup ? (
          <GroupDetails groupId={selectedGroup} />
        ) : (
          <div className="flex items-center justify-center h-full border border-gray-800 rounded-lg dashboard-card">
            <p className="text-lg text-gray-400">
              Select a group or create a new one to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
