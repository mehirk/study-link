import useGroupStore from "@store/group-store";
import { useMembersQuery } from "@hooks/use-zero-queries";
import MemberCard from "../member-card";
import type { GroupMember } from "@lib/group-permissions";
import { Loader2 } from "lucide-react";

const GroupMembers = () => {
  const groupId = useGroupStore((state) => state.currentGroupId)!;
  const { members, membersDetails } = useMembersQuery(groupId);

  const loading = membersDetails.type === "unknown";

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center h-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-4 border-b bg-muted flex justify-between items-center">
        <h3 className="font-semibold">Group Members - {members.length}</h3>
      </div>
      <div className="grid p-3 md:p-6 grid-cols-1 gap-3 md:gap-4">
        {members.map((member) => (
          <MemberCard key={member.id} member={member as GroupMember} />
        ))}
      </div>
    </div>
  );
};

export default GroupMembers;
