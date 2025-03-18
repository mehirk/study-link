import { useState } from "react";

interface GroupDetailsProps {
  groupId: string;
}

const GroupDetails = ({ groupId }: GroupDetailsProps) => {
  // Mock data - in a real app, this would come from an API
  const group = {
    id: groupId,
    name: "Group Name",
    description: "Description",
  };

  const [activeTab, setActiveTab] = useState("discussions");

  const tabs = [
    { id: "discussions", label: "Discussions" },
    { id: "files", label: "Files & Resources" },
    { id: "members", label: "Members" },
    { id: "academic", label: "Academic/Progress" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="h-full flex flex-col border border-gray-800 rounded-lg dashboard-card">
      {/* Group header */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-semibold">{group.name}</h1>
        <p className="text-gray-400">{group.description}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-3 text-sm font-medium dashboard-tabs-button ${
                activeTab === tab.id ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 p-6">
        {activeTab === "discussions" && (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">Discussions content will go here</p>
          </div>
        )}
        {activeTab === "files" && (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">Files & Resources content will go here</p>
          </div>
        )}
        {activeTab === "members" && (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">Members content will go here</p>
          </div>
        )}
        {activeTab === "academic" && (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">Academic/Progress content will go here</p>
          </div>
        )}
        {activeTab === "settings" && (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">Settings content will go here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetails; 