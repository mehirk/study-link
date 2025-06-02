import { useMutation } from "@tanstack/react-query";
import { toast } from "@components/ui/use-toast";
import { changeUserRole, removeMember, leaveGroup } from "@lib/api/group";
import useGroupStore from "@store/group-store";
import useChatStore from "@store/chat-store";

export const useGroupMemberOperations = (groupId: number) => {
  const setCurrentGroup = useGroupStore((state) => state.setCurrentGroup);
  const setActiveTab = useGroupStore((state) => state.setActiveTab);
  const setCurrentDiscussionId = useChatStore(
    (state) => state.setCurrentDiscussionId
  );

  const removeMemberMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: string }) =>
      removeMember(groupId, userId),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member removed successfully",
      });
    },
    onError: (error) => {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: number) => leaveGroup(groupId),
    onSuccess: () => {
      setCurrentDiscussionId(null);
      setCurrentGroup(null);
      setActiveTab("discussions");
    },
    onError: (error) => {
      console.error("Error leaving group:", error);
      toast({
        title: "Error",
        description: "Failed to leave group. Please try again.",
        variant: "destructive",
      });
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({
      groupId,
      userId,
      role,
    }: {
      groupId: number;
      userId: string;
      role: "ADMIN" | "MEMBER";
    }) => changeUserRole(groupId, userId, role),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    },
    onError: (error) => {
      console.error("Error changing role:", error);
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRemoveMember = (userId: string) => {
    removeMemberMutation.mutate({ groupId, userId });
  };

  const handleLeaveGroup = () => {
    leaveGroupMutation.mutate(groupId);
  };

  const handleChangeRole = (userId: string, newRole: "ADMIN" | "MEMBER") => {
    changeRoleMutation.mutate({ groupId, userId, role: newRole });
  };

  return {
    removeMemberMutation,
    leaveGroupMutation,
    changeRoleMutation,
    handleRemoveMember,
    handleLeaveGroup,
    handleChangeRole,
  };
};
