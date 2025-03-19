import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import GroupMembers from "./GroupMembers";
import GroupSettings from "./GroupSettings";
import { Loader2, ShieldAlert } from "lucide-react";
import { getGroupById, Group as ApiGroup, getGroupMembers } from "../../lib/api/group";

interface GroupDetailsProps {
  groupId: number;
}

interface GroupData {
  id: number;
  name: string;
  description: string;
  members?: {
    userId: number;
    role: "ADMIN" | "MEMBER";
  }[];
}

// User interface to match the AuthContext
interface User {
  id: number;
  name: string;
  email: string;
}

const GroupDetails = ({ groupId }: GroupDetailsProps) => {
  const [group, setGroup] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("discussions");
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  // Debug logs
  console.log("GroupDetails rendered with groupId:", groupId);
  console.log("Current user:", user);
  console.log("isAdmin status:", isAdmin);
  console.log("Active tab:", activeTab);

  // Add effect to track isAdmin changes
  useEffect(() => {
    console.log("isAdmin changed to:", isAdmin);
  }, [isAdmin]);

  // Make sure admin status check runs when switching to settings tab
  useEffect(() => {
    if (activeTab === "settings" && group && user) {
      console.log("Settings tab selected, verifying admin status");
      // Re-check admin status from the group data when settings tab is selected
      const members = group.members || [];
      const isMemberAdmin = members.some(
        member => 
          String(member.userId) === String(user.id) && 
          member.role === "ADMIN"
      );
      
      if (isMemberAdmin && !isAdmin) {
        console.log("Fixing admin status to true for settings tab");
        setIsAdmin(true);
      }
    }
  }, [activeTab, group, user, isAdmin]);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        console.log("Fetching group details for groupId:", groupId);
        setLoading(true);
        setError(null);
        
        // Use the API client instead of direct axios call
        const groupData = await getGroupById(groupId);
        const members = await getGroupMembers(groupId);
        
        console.log("Group data received:", groupData); // Debug
        console.log("Members received:", members); // Debug
        console.log("Raw members data:", JSON.stringify(members, null, 2)); // Show complete JSON structure
        
        // Convert API Group type to our GroupData type
        const formattedGroup: GroupData = {
          id: groupData.id,
          name: groupData.name,
          description: groupData.description || "", // Handle potential undefined
          members: members.map(m => ({
            userId: Number(m.userId),
            role: m.role
          }))
        };
        
        console.log("Formatted group:", formattedGroup);
        setGroup(formattedGroup);
        
        // Check if the current user is an admin of this group
        if (user) {
          // Check admin status directly from the API response
          const currentUserMembership = members.find(
            member => String(member.userId) === String(user.id)
          );
          
          console.log("Current user ID:", user.id);
          console.log("Current user membership from API:", currentUserMembership);
          
          // Force the role check to be case-insensitive and ensure it's a string comparison
          const userRole = currentUserMembership?.role;
          const adminStatus = typeof userRole === 'string' && 
                             userRole.toUpperCase() === "ADMIN";
          
          console.log("User role from API:", userRole);
          console.log("Setting admin status to:", adminStatus);
          
          // Ensure we update the state correctly
          setIsAdmin(adminStatus);
        }
      } catch (error) {
        console.error("Error fetching group details:", error);
        setError("Failed to load group details. Please try again.");
        // Don't set group to null here, keep the previous state
      } finally {
        setLoading(false);
      }
    };

    if (groupId) {
      fetchGroupDetails();
    } else {
      console.log("No groupId provided, skipping API call");
    }
  }, [groupId, user]);

  const handleGroupUpdated = (updatedGroup: GroupData) => {
    setGroup(updatedGroup);
  };

  const handleGroupDeleted = () => {
    // Redirect to dashboard or do something else
    window.location.href = "/dashboard";
  };

  // Define all tabs
  const tabs = [
    { id: "discussions", label: "Discussions" },
    { id: "files", label: "Files & Resources" },
    { id: "members", label: "Members" },
    { id: "academic", label: "Academic/Progress" },
    { id: "settings", label: "Settings" },
  ];

  // Handle tab change
  const handleTabChange = (value: string) => {
    console.log("Tab changed to:", value);
    setActiveTab(value);
    
    // If switching to settings tab, verify admin status
    if (value === "settings" && user && group?.members) {
      console.log("Verifying admin status for settings tab");
    }
  };

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
        <p className="text-muted-foreground">Group not found. Please select another group.</p>
      </Card>
    );
  }

  // Just a basic access check message for non-admin users trying to view settings
  const AdminOnlyMessage = () => (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="text-center max-w-md">
        <ShieldAlert className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Admin Access Required</h3>
        <p className="text-muted-foreground">
          Only group administrators can access and modify settings.
        </p>
      </div>
    </div>
  );

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

      <CardContent className="flex-1 p-0">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="h-full flex flex-col">
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
            <GroupMembers groupId={groupId} isAdmin={isAdmin} />
          </TabsContent>
          
          <TabsContent
            value="academic"
            className="flex-1 border-none p-6 data-[state=active]:flex items-center justify-center"
          >
            <p className="text-muted-foreground">
              Academic/Progress content will go here
            </p>
          </TabsContent>
          
          <TabsContent
            value="settings"
            className="flex-1 border-none p-6 data-[state=active]:flex"
          >
            {/* The settings tab will render for admins only */}
            {(isAdmin === true) ? (
              <GroupSettings 
                groupId={groupId} 
                groupData={group} 
                isAdmin={isAdmin} 
                onGroupUpdated={handleGroupUpdated}
                onGroupDeleted={handleGroupDeleted}
              />
            ) : (
              <AdminOnlyMessage />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default GroupDetails; 