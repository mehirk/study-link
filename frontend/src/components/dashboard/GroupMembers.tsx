import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Loader2, UserX, UserPlus, ShieldAlert } from "lucide-react";
import { getGroupMembers, changeUserRole, removeMember } from "../../lib/api/group";

interface MemberProps {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
  profileImage?: string;
}

interface GroupMembersProps {
  groupId: number;
  isAdmin: boolean;
}

const GroupMembers = ({ groupId, isAdmin }: GroupMembersProps) => {
  const [members, setMembers] = useState<MemberProps[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [removingUser, setRemovingUser] = useState<number | null>(null);
  const [changingRole, setChangingRole] = useState<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const groupMembersData = await getGroupMembers(groupId);
        
        // Transform the API data to match our component's expected format
        const formattedMembers: MemberProps[] = groupMembersData.map(member => ({
          id: Number(member.userId),
          name: member.user.name,
          email: member.user.email,
          role: member.role,
          profileImage: member.user.image
        }));
        
        setMembers(formattedMembers);
      } catch (error) {
        console.error("Error fetching members:", error);
        alert("Failed to load group members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [groupId]);

  const handleRemoveMember = async (userId: number) => {
    try {
      setRemovingUser(userId);
      await removeMember(groupId, userId.toString());
      setMembers(members.filter((member) => member.id !== userId));
      alert("Member removed successfully");
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member");
    } finally {
      setRemovingUser(null);
    }
  };

  const handleChangeRole = async (userId: number, newRole: "ADMIN" | "MEMBER") => {
    try {
      setChangingRole(userId);
      await changeUserRole(groupId, userId.toString(), newRole);
      setMembers(
        members.map((member) =>
          member.id === userId ? { ...member, role: newRole } : member
        )
      );
      alert(`User is now ${newRole.toLowerCase()}`);
    } catch (error) {
      console.error("Error changing role:", error);
      alert("Failed to change user role");
    } finally {
      setChangingRole(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <h2 className="text-xl font-semibold">Group Members ({members.length})</h2>
      <div className="grid grid-cols-1 gap-4">
        {members.map((member) => (
          <Card key={member.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={member.profileImage || ""} />
                    <AvatarFallback>
                      {member.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{member.name}</p>
                      <Badge variant={member.role === "ADMIN" ? "destructive" : "outline"}>
                        {member.role}
                      </Badge>
                      {user && member.id === Number(user.id) && (
                        <Badge variant="secondary">You</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                {isAdmin && user && member.id !== Number(user.id) && (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleChangeRole(
                          member.id,
                          member.role === "ADMIN" ? "MEMBER" : "ADMIN"
                        )
                      }
                      disabled={!!changingRole}
                    >
                      {changingRole === member.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 mr-2" />
                      )}
                      {member.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={!!removingUser}
                    >
                      {removingUser === member.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <UserX className="w-4 h-4 mr-2" />
                      )}
                      Remove
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