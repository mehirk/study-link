import { useState } from "react";
import { CardHeader, CardContent } from "@components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/tabs";
import GroupMembers from "@components/dashboard/tabs/group-members";
import GroupSettings from "@components/dashboard/tabs/group-settings";
import GroupFiles from "@components/dashboard/tabs/group-files";
import DiscussionsLayout from "@components/dashboard/tabs/discussions-layout";
import { ShieldAlert } from "lucide-react";
import { getGroupMembers } from "@lib/api/group";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "@store/auth-store";
import useGroupStore from "@store/group-store";

const GroupDetails = () => {
  const [activeTab, setActiveTab] = useState("discussions");
  const user = useAuthStore((state) => state.user);
  const group = useGroupStore((state) => state.currentGroup);

  const { data: members = [] } = useQuery({
    queryKey: ["group-members", group?.id],
    queryFn: () => getGroupMembers(group?.id as number),
    enabled: !!group?.id,
  });

  if (!group) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-gray-400">
          Join a group or create a new one to get started
        </p>
      </div>
    );
  }
  const groupId = group.id;

  const isAdmin = members.some(
    (member) =>
      String(member.userId) === String(user?.id) && member.role === "ADMIN"
  );

  const tabs = [
    { id: "discussions", label: "Discussions" },
    { id: "files", label: "Files & Resources" },
    { id: "members", label: "Members" },
    ...(isAdmin ? [{ id: "settings", label: "Settings" }] : []),
  ];

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{group.name}</h1>
            <p className="text-muted-foreground text-sm">{group.description}</p>
          </div>
          {isAdmin && (
            <div className="flex items-center text-xs font-medium text-primary">
              <ShieldAlert className="w-4 h-4 mr-1" />
              Admin
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 h-full ">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="h-full flex flex-col"
        >
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent
            value="discussions"
            className="flex-1 border-none data-[state=active]:flex"
          >
            <DiscussionsLayout groupId={groupId} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent
            value="files"
            className="flex-1 border-none p-6 data-[state=active]:flex flex-col"
          >
            <GroupFiles groupId={groupId} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent
            value="members"
            className="flex-1 border-none p-6 data-[state=active]:flex flex-col"
          >
            <GroupMembers
              groupId={groupId}
              members={members}
              isAdmin={isAdmin}
            />
          </TabsContent>

          {isAdmin && (
            <TabsContent
              value="settings"
              className="flex-1 border-none p-6 data-[state=active]:flex flex-col"
            >
              <GroupSettings />
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </div>
  );
};

export default GroupDetails;
