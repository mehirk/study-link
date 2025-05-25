import { useEffect, useState } from "react";
import CreateGroupModal from "@components/dashboard/modals/create-group-modal";
import JoinGroupModal from "@components/dashboard/modals/join-group-modal";
import GroupActionModal from "@components/dashboard/modals/group-action-modal";
import { Button } from "@components/ui/button";
import { ScrollArea } from "@components/ui/scroll-area";
import GroupAvatar from "@components/ui/group-avatar";
import { cn } from "@lib/utils";
import { Group, createGroup, joinGroup, fetchUserGroups } from "@lib/api/group";
import { useToast } from "@components/ui/use-toast";
import { Loader2, Plus } from "lucide-react";
import useGroupStore from "@store/group-store";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useChatStore from "@store/chat-store";

const GroupSidebar = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isGroupActionModalOpen, setIsGroupActionModalOpen] = useState(false);
  const { toast } = useToast();
  const currentGroup = useGroupStore((state) => state.currentGroup);
  const setCurrentGroup = useGroupStore((state) => state.setCurrentGroup);
  const setCurrentDiscussionId = useChatStore(
    (state) => state.setCurrentDiscussionId
  );
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: fetchUserGroups,
  });

  useEffect(() => {
    if (groups.length > 0 && !currentGroup) {
      setCurrentGroup(groups[0]);
    }
  }, [groups, currentGroup, setCurrentGroup]);

  const handleSelectGroup = (groupId: number) => {
    const selectedGroup = groups.find((group: Group) => group.id === groupId);
    if (selectedGroup) {
      setCurrentGroup(selectedGroup);
      setCurrentDiscussionId(null);
    }
  };

  const handleCreateGroup = async (name: string, description: string) => {
    try {
      const newGroup = await createGroup({ name, description });
      setCurrentGroup(newGroup);
      setCurrentDiscussionId(null);
      queryClient.invalidateQueries({ queryKey: ["groups"] });
    } catch (error) {
      console.error("Failed to create group:", error);
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleJoinGroup = async (groupId: string, password?: string) => {
    try {
      await joinGroup(Number(groupId), password);

      await queryClient.invalidateQueries({ queryKey: ["groups"] });
      const updatedGroups = await queryClient.fetchQuery({
        queryKey: ["groups"],
        queryFn: fetchUserGroups,
      });

      const joinedGroup = updatedGroups.find((g) => g.id === Number(groupId));
      if (joinedGroup) {
        setCurrentGroup(joinedGroup);
        setCurrentDiscussionId(null);
      }
    } catch (error) {
      console.error("Failed to join group:", error);
      toast({
        title: "Error",
        description:
          "Failed to join group. Please check the group ID and password.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-16 md:w-64 min-w-16 md:min-w-64 border-r h-auto flex flex-col">
      {/* Header - Desktop only */}
      <div className="hidden md:block p-4 border-b">
        <a
          href="/dashboard"
          className="text-lg font-semibold hover:text-muted-foreground transition-colors cursor-pointer"
        >
          My Dashboard
        </a>
      </div>

      {/* Create/Join Group buttons - Desktop only */}
      <div className="hidden md:block p-4 space-y-2">
        <Button className="w-full" onClick={() => setIsCreateModalOpen(true)}>
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

      {/* Groups heading - Desktop only */}
      <div className="hidden md:block px-4 py-4 text-base font-extrabold text-muted-foreground">
        Groups
      </div>
      {/* Groups list */}
      <ScrollArea className="flex-1">
        <div className="px-2">
          {isLoading ? (
            <div className="flex justify-center p-2">
              <Loader2 className="animate-spin" />
            </div>
          ) : groups.length > 0 ? (
            <>
              {groups.map((group: Group) => (
                <button
                  key={group.id}
                  className={cn(
                    "w-full px-1 md:px-3 my-1 py-2 text-left rounded-md transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "flex items-center gap-3 md:gap-3",
                    currentGroup?.id === group.id &&
                      "bg-accent text-accent-foreground"
                  )}
                  onClick={() => handleSelectGroup(group.id)}
                >
                  {/* Mobile: Avatar with initials */}
                  <div className="md:hidden flex justify-center w-full">
                    <GroupAvatar name={group.name} />
                  </div>
                  {/* Desktop: Full name */}
                  <span className="hidden md:block">{group.name}</span>
                </button>
              ))}
              {/* Add group button - Mobile (in the list) */}
              <button
                className="md:hidden w-full px-1 my-1 py-2 text-left rounded-md transition-colors hover:bg-accent hover:text-accent-foreground flex items-center justify-center text-muted-foreground"
                onClick={() => setIsGroupActionModalOpen(true)}
              >
                <div className="flex items-center justify-center rounded-full border-2 border-dashed border-muted-foreground w-8 h-8">
                  <Plus className="h-4 w-4" />
                </div>
              </button>
            </>
          ) : (
            <>
              {/* Mobile empty state */}
              <div className="md:hidden w-full px-1 my-1 py-2 text-left rounded-md transition-colors hover:bg-accent hover:text-accent-foreground flex items-center justify-center text-muted-foreground">
                <button
                  className="flex items-center justify-center rounded-full border-2 border-dashed border-muted-foreground w-8 h-8"
                  onClick={() => setIsGroupActionModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {/* Desktop empty state */}
              <div className="hidden md:block text-center p-4 text-muted-foreground">
                No groups yet.
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Modals */}
      <GroupActionModal
        isOpen={isGroupActionModalOpen}
        onClose={() => setIsGroupActionModalOpen(false)}
        onCreateGroup={() => setIsCreateModalOpen(true)}
        onJoinGroup={() => setIsJoinModalOpen(true)}
      />
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
