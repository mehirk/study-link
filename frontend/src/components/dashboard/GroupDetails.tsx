import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import GroupMembers from "./GroupMembers";
import GroupSettings from "./GroupSettings";
import { Loader2, ShieldAlert } from "lucide-react";
import {
  getGroupById,
  getGroupMembers,
  Group,
  GroupMember,
} from "../../lib/api/group";

interface GroupDetailsProps {
  groupId: number;
}

const GroupDetails = ({ groupId }: GroupDetailsProps) => {
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("discussions");
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [fetchTrigger, setFetchTrigger] = useState(0);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const [groupData, members] = await Promise.all([
          getGroupById(groupId),
          getGroupMembers(groupId),
        ]);

        setMembers(members);
        setGroup(groupData);

        const userIsAdmin = members.some(
          (member) =>
            String(member.userId) === String(user?.id) &&
            member.role === "ADMIN"
        );
        setIsAdmin(userIsAdmin);
      } catch (error) {
        console.error("Error fetching group details:", error);
        setError("Failed to load group details. Please try again.");
      } finally {
        setLoading(false);
        setFetchTrigger(0);
      }
    };

    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId, user, fetchTrigger]);

  const tabs = [
    { id: "discussions", label: "Discussions" },
    { id: "files", label: "Files & Resources" },
    { id: "members", label: "Members" },
    ...(isAdmin ? [{ id: "settings", label: "Settings" }] : []),
  ];

  if (loading) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <p className="text-destructive">{error}</p>
      </Card>
    );
  }

  if (!group) {
    return (
      <Card className="h-full flex flex-col items-center justify-center">
        <p className="text-muted-foreground">
          Group not found. Please select another group.
        </p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{group.name}</h1>
            <p className="text-muted-foreground">{group.description}</p>
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
            className="flex-1 border-none p-6 data-[state=active]:flex items-center justify-center"
          >
            <p className="text-muted-foreground">
              Discussions content will go here
            </p>
          </TabsContent>

          <TabsContent
            value="files"
            className="flex-1 border-none p-6 data-[state=active]:flex items-center justify-center"
          >
            <p className="text-muted-foreground">
              Files & Resources content will go here
            </p>
          </TabsContent>

          <TabsContent
            value="members"
            className="flex-1 border-none p-6 data-[state=active]:flex"
          >
            <GroupMembers
              groupId={groupId}
              isAdmin={isAdmin}
              members={members}
              setFetchTrigger={setFetchTrigger}
            />
          </TabsContent>

          <TabsContent
            value="settings"
            className="flex-1 border-none p-6 data-[state=active]:flex"
          >
            {isAdmin === true ? (
              <GroupSettings
                groupId={groupId}
                isAdmin={isAdmin}
                groupData={group}
                onGroupUpdated={setGroup}
                setFetchTrigger={setFetchTrigger}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="text-center max-w-md">
                  <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    Admin Access Required
                  </h3>
                  <p className="text-muted-foreground">
                    Only group administrators can access and modify settings.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GroupDetails;
