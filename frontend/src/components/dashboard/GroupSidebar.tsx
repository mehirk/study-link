import { useState } from "react";
import CreateGroupModal from "./CreateGroupModal";
import JoinGroupModal from "./JoinGroupModal";

interface GroupSidebarProps {
  onSelectGroup: (groupId: string | null) => void;
}

const GroupSidebar = ({ onSelectGroup }: GroupSidebarProps) => {
  // Mock data for groups
  const [groups, setGroups] = useState([
    { id: "1", name: "Group 1" },
    { id: "2", name: "Group 2" },
    { id: "3", name: "Group 3" },
    { id: "4", name: "Group 4" },
    { id: "5", name: "Group 5" },
  ]);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const handleGroupClick = (groupId: string) => {
    setSelectedGroupId(groupId);
    onSelectGroup(groupId);
  };

  const handleCreateGroup = (name: string, description: string) => {
    // In a real app, this would make an API call and use the description
    const newGroup = {
      id: `${groups.length + 1}`,
      name,
      // Using description in the newGroup object to avoid unused parameter warning
      description,
    };
    setGroups([...groups, newGroup]);
  };

  const handleJoinGroup = (groupCode: string) => {
    // In a real app, this would make an API call using the group code
    console.log(`Joining group with code: ${groupCode}`);
  };

  return (
    <div className="w-64 border-r border-gray-800 h-full flex flex-col dashboard-sidebar">
      <div className="p-4 border-b border-gray-800">
        <a href="/dashboard" className="text-lg font-semibold text-white hover:text-gray-400 transition-colors cursor-pointer">My Dashboard</a>
      </div>
      
      {/* Create/Join Group buttons */}
      <div className="p-4 space-y-2">
        <button 
          className="w-full py-2 px-4 rounded-md text-white dashboard-button"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Group
        </button>
        <button 
          className="w-full py-2 px-4 rounded-md text-white dashboard-button"
          onClick={() => setIsJoinModalOpen(true)}
        >
          Join Group
        </button>
      </div>
      
      {/* Groups heading */}
      <div className="px-4 py-2 text-sm font-medium uppercase text-gray-400">
        Groups
      </div>
      
      {/* Groups list */}
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {groups.map((group) => (
            <li 
              key={group.id}
              className={`px-2 py-2 cursor-pointer rounded-md hover:bg-gray-800 transition-colors ${
                selectedGroupId === group.id ? "bg-gray-800" : ""
              }`}
              onClick={() => handleGroupClick(group.id)}
            >
              {group.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Modals */}
      <CreateGroupModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
      <JoinGroupModal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        onJoinGroup={handleJoinGroup}
      />
    </div>
  );
};

export default GroupSidebar; 