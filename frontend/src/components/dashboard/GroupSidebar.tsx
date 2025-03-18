import { useState } from "react";
import CreateGroupModal from "./CreateGroupModal";
import JoinGroupModal from "./JoinGroupModal";
import { Button } from "@components/ui/button";
import { ScrollArea } from "@components/ui/scroll-area";
import { cn } from "@lib/utils";

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
      description,
    };
    setGroups([...groups, newGroup]);
  };

  const handleJoinGroup = (groupCode: string) => {
    // In a real app, this would make an API call using the group code
    console.log(`Joining group with code: ${groupCode}`);
  };

  return (
    <div className="w-64 border-r h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-center">
        <a
          href="/dashboard"
          className="text-lg font-semibold hover:text-muted-foreground transition-colors cursor-pointer"
        >
          My Dashboard
        </a>
      </div>

      {/* Create/Join Group buttons */}
      <div className="p-4 space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Group
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsJoinModalOpen(true)}
        >
          Join Group
        </Button>
      </div>

      {/* Groups heading */}
      <div className="px-4 py-2 text-sm font-medium uppercase text-muted-foreground">
        Groups
      </div>

      {/* Groups list */}
      <ScrollArea className="flex-1">
        <div className="px-2">
          {groups.map((group) => (
            <button
              key={group.id}
              className={cn(
                "w-full px-2 py-2 text-left rounded-md transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                selectedGroupId === group.id &&
                  "bg-accent text-accent-foreground border-1 border-primary"
              )}
              onClick={() => handleGroupClick(group.id)}
            >
              {group.name}
            </button>
          ))}
        </div>
      </ScrollArea>

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
