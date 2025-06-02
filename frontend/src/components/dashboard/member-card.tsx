import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { UserX, ShieldAlert } from "lucide-react";
import { getInitials } from "@lib/utils";
import {
  canRemoveMember,
  canPromoteToAdmin,
  canLeaveGroup,
  isCurrentUser,
  type GroupMember,
} from "@lib/group-permissions";
import { useMembershipOperations } from "@hooks/use-membership-operations";
import useGroupStore from "@store/group-store";
import useAuthStore from "@store/auth-store";

interface MemberCardProps {
  member: GroupMember;
}

const MemberCard = ({ member }: MemberCardProps) => {
  const groupId = useGroupStore((state) => state.currentGroupId)!;
  const currentUser = useAuthStore((state) => state.user);
  const isCurrentUserAdmin = useGroupStore((state) => state.isAdmin);

  const { handleRemoveMember, handleLeaveGroup, handleChangeRole } =
    useMembershipOperations(groupId);

  const showAdminActions = canPromoteToAdmin(
    currentUser,
    member,
    isCurrentUserAdmin
  );
  const showRemoveAction = canRemoveMember(
    currentUser,
    member,
    isCurrentUserAdmin
  );
  const showLeaveAction = canLeaveGroup(currentUser, member);
  const isMemberCurrentUser = isCurrentUser(currentUser, member);

  return (
    <Card className="overflow-hidden shadow-none">
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 md:h-12 md:w-12">
              <AvatarImage
                className="object-cover"
                src={member.user?.image || ""}
              />
              <AvatarFallback className="text-sm">
                {getInitials(member.user?.name || "")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium text-sm md:text-base truncate">
                  {member.user?.name}
                </p>
                <Badge
                  variant={member.role === "ADMIN" ? "destructive" : "outline"}
                  className="text-xs"
                >
                  {member.role}
                </Badge>
                {isMemberCurrentUser && (
                  <Badge variant="secondary" className="text-xs">
                    You
                  </Badge>
                )}
              </div>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {member.user?.email}
              </p>
            </div>
          </div>

          {(showAdminActions || showRemoveAction) && (
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {showAdminActions && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleChangeRole(member.userId, "ADMIN")}
                  className="w-full sm:w-auto text-xs"
                >
                  <ShieldAlert className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Make Admin
                </Button>
              )}
              {showRemoveAction && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveMember(member.userId)}
                  className="w-full sm:w-auto text-xs"
                >
                  <UserX className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  Remove
                </Button>
              )}
            </div>
          )}

          {showLeaveAction && (
            <div className="w-full sm:w-auto">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleLeaveGroup}
                className="w-full sm:w-auto text-xs"
              >
                <UserX className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                Leave Group
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberCard;
