import useAuthStore from "@store/auth-store";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Loader2, UserX, ShieldAlert } from "lucide-react";
import {
  changeUserRole,
  removeMember,
  leaveGroup,
  getGroupMembers,
} from "@lib/api/group";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@components/ui/use-toast";
import { getInitials } from "@lib/utils";
import useGroupStore from "@store/group-store";
import useChatStore from "@store/chat-store";

const GroupMembers = () => {
  const user = useAuthStore((state) => state.user);
  const groupId = useGroupStore((state) => state.currentGroupId)!;
  const isAdmin = useGroupStore((state) => state.isAdmin);
  const setCurrentGroup = useGroupStore((state) => state.setCurrentGroup);
  const setActiveTab = useGroupStore((state) => state.setActiveTab);
  const setCurrentDiscussionId = useChatStore(
    (state) => state.setCurrentDiscussionId
  );
  const queryClient = useQueryClient();

  const { data: members = [] } = useQuery({
    queryKey: ["group-members", groupId],
    queryFn: () => getGroupMembers(groupId),
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: number; userId: string }) =>
      removeMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
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

  // Leave group mutation
  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: number) => leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["groups"] });
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

  // Change role mutation
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
      queryClient.invalidateQueries({ queryKey: ["group-members", groupId] });
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
    if (!user) return;
    leaveGroupMutation.mutate(groupId);
  };

  const handleChangeRole = (userId: string, newRole: "ADMIN" | "MEMBER") => {
    changeRoleMutation.mutate({ groupId, userId, role: newRole });
  };

  return (
    <div className="w-full">
      <div className="p-4 border-b bg-muted flex justify-between items-center">
        <h3 className="font-semibold">Group Members - {members.length}</h3>
      </div>
      <div className="grid p-3 md:p-6 grid-cols-1 gap-3 md:gap-4">
        {members.map((member) => (
          <Card key={member.id} className="overflow-hidden shadow-none">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 md:h-12 md:w-12">
                    <AvatarImage
                      className="object-cover"
                      src={member.user.image || ""}
                    />
                    <AvatarFallback className="text-sm">
                      {getInitials(member.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-sm md:text-base truncate">
                        {member.user.name}
                      </p>
                      <Badge
                        variant={
                          member.role === "ADMIN" ? "destructive" : "outline"
                        }
                        className="text-xs"
                      >
                        {member.role}
                      </Badge>
                      {user && member.id === Number(user.id) && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                {isAdmin &&
                  user &&
                  member.id !== Number(user.id) &&
                  member.role === "MEMBER" && (
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleChangeRole(
                            member.userId,
                            member.role === "ADMIN" ? "MEMBER" : "ADMIN"
                          )
                        }
                        disabled={changeRoleMutation.isPending}
                        className="w-full sm:w-auto text-xs"
                      >
                        {changeRoleMutation.isPending &&
                        changeRoleMutation.variables?.userId ===
                          member.userId ? (
                          <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-spin" />
                        ) : (
                          <ShieldAlert className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        )}
                        Make Admin
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member.userId)}
                        disabled={removeMemberMutation.isPending}
                        className="w-full sm:w-auto text-xs"
                      >
                        {removeMemberMutation.isPending &&
                        removeMemberMutation.variables?.userId ===
                          member.userId ? (
                          <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-spin" />
                        ) : (
                          <UserX className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        )}
                        Remove
                      </Button>
                    </div>
                  )}
                {user &&
                  member.userId === user.id &&
                  member.role === "MEMBER" && (
                    <div className="w-full sm:w-auto">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleLeaveGroup}
                        disabled={leaveGroupMutation.isPending}
                        className="w-full sm:w-auto text-xs"
                      >
                        {leaveGroupMutation.isPending ? (
                          <Loader2 className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2 animate-spin" />
                        ) : (
                          <UserX className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        )}
                        Leave Group
                      </Button>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GroupMembers;
