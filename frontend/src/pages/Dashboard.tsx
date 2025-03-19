import GroupDetails from "@components/dashboard/GroupDetails";
import GroupSidebar from "@components/dashboard/GroupSidebar";
import { useState } from "react";

const Dashboard = () => {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  return (
    <div className="flex h-screen overflow-hidden dashboard">
      <GroupSidebar onSelectGroup={setSelectedGroup} />

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
