import GroupDetails from "../components/dashboard/GroupDetails";
import GroupSidebar from "../components/dashboard/GroupSidebar";
import { useState } from "react";
import { fetchUserGroups } from "@lib/api/group";
import { useToast } from "@components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const Dashboard = () => {
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: groups = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["groups"],
    queryFn: fetchUserGroups,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (groups.length > 0 && !selectedGroup) {
    setSelectedGroup(groups[0]?.id || null);
  }

  if (error) {
    console.error("Failed to load groups:", error);
    toast({
      title: "Error",
      description: "Failed to load your groups. Please try again.",
      variant: "destructive",
    });
  }

  const refreshGroups = async (groupId?: number) => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["groups"] });

      if (groupId) {
        setSelectedGroup(groupId);
      }
    } catch (error) {
      console.error("Failed to refresh groups:", error);
      toast({
        title: "Error",
        description: "Failed to refresh your groups. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-55px)] dashboard">
      <GroupSidebar
        selectedGroupId={selectedGroup}
        onSelectGroup={setSelectedGroup}
        groups={groups}
        loading={isLoading}
        refreshGroups={refreshGroups}
      />

      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : selectedGroup ? (
          <GroupDetails groupId={selectedGroup} />
        ) : (
          <div className="flex items-center justify-center h-full border border-gray-800 rounded-lg dashboard-card">
            <p className="text-lg text-gray-400">
              Join a group or create a new one to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
