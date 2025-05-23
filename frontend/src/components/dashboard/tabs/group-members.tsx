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

const GroupMembers = () => {
  const user = useAuthStore((state) => state.user);
  const groupId = useGroupStore((state) => state.currentGroup?.id) as number;
  const isAdmin = useGroupStore((state) => state.isAdmin);
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
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
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
      window.location.reload();
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
      queryClient.invalidateQueries({ queryKey: ["groupMembers", groupId] });
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
    <div className="space-y-4 w-full">
      <h2 className="text-xl font-semibold">
        Group Members ({members.length})
      </h2>
      <div className="grid grid-cols-1 gap-4">
        {members.map((member) => (
          <Card key={member.id} className="overflow-hidden shadow-none">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage
                      className="object-cover"
                      src={member.user.image || ""}
                    />
                    <AvatarFallback>
                      {getInitials(member.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{member.user.name}</p>
                      <Badge
                        variant={
                          member.role === "ADMIN" ? "destructive" : "outline"
                        }
                      >
                        {member.role}
                      </Badge>
                      {user && member.id === Number(user.id) && (
                        <Badge variant="secondary">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {member.user.email}
                    </p>
                  </div>
                </div>
                {isAdmin &&
                  user &&
                  member.id !== Number(user.id) &&
                  member.role === "MEMBER" && (
                    <div className="flex space-x-2">
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
                      >
                        {changeRoleMutation.isPending &&
                        changeRoleMutation.variables?.userId ===
                          member.userId ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 mr-2" />
                        )}
                        {"Make Admin"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member.userId)}
                        disabled={removeMemberMutation.isPending}
                      >
                        {removeMemberMutation.isPending &&
                        removeMemberMutation.variables?.userId ===
                          member.userId ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <UserX className="w-4 h-4 mr-2" />
                        )}
                        Remove
                      </Button>
                    </div>
                  )}
                {user &&
                  member.userId === user.id &&
                  member.role === "MEMBER" && (
                    <div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleLeaveGroup}
                        disabled={leaveGroupMutation.isPending}
                      >
                        {leaveGroupMutation.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <UserX className="w-4 h-4 mr-2" />
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
