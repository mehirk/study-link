import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "../ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Switch } from "../ui/switch";
import { Loader2, Trash2, Save, Shield, Users, Lock } from "lucide-react";
import { updateGroup, deleteGroup } from "../../lib/api/group";

interface GroupData {
  id: number;
  name: string;
  description: string;
  private: boolean;
  requireApproval: boolean;
  password?: string;
}

interface GroupSettingsProps {
  groupId: number;
  groupData: GroupData;
  isAdmin: boolean;
  onGroupUpdated: (data: GroupData) => void;
  onGroupDeleted: () => void;
}

const GroupSettings = ({ 
  groupId, 
  groupData, 
  isAdmin, 
  onGroupUpdated, 
  onGroupDeleted 
}: GroupSettingsProps) => {
  const [name, setName] = useState(groupData.name);
  const [description, setDescription] = useState(groupData.description || "");
  const [isPrivate, setIsPrivate] = useState(Boolean(groupData.private));
  const [requireApproval, setRequireApproval] = useState(Boolean(groupData.requireApproval));
  const [groupPassword, setGroupPassword] = useState(groupData.password || "");
  
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { user } = useAuth();

  console.log("GroupSettings rendered with isAdmin:", isAdmin);

  const clearMessages = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMessage("Group name cannot be empty");
      return;
    }

    clearMessages();
    try {
      setIsSaving(true);
      const response = await updateGroup(groupId, { 
        name, 
        description,
        isPrivate,
        requireApproval,
        password: isPrivate && groupPassword ? groupPassword : undefined 
      });
      
      // Convert to GroupData format
      const updatedGroup: GroupData = {
        id: response.id,
        name: response.name,
        description: response.description || "",
        private: response.private,
        requireApproval: response.requireApproval,
        password: response.password
      };
      
      onGroupUpdated(updatedGroup);
      setSuccessMessage("Group settings updated successfully");
    } catch (error) {
      console.error("Error updating group:", error);
      setErrorMessage("Failed to update group settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    clearMessages();
    try {
      setIsDeleting(true);
      await deleteGroup(groupId);
      
      onGroupDeleted();
      // No need to set success message as we're redirecting
    } catch (error) {
      console.error("Error deleting group:", error);
      setErrorMessage("Failed to delete group");
      setIsDeleting(false);
    }
  };

  // The admin check is now done in the parent component
  // This component assumes it will only be rendered for admin users

  return (
    <div className="space-y-6 w-full">
      {successMessage && (
        <div className="bg-green-500/20 text-green-700 p-3 rounded-md text-sm">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-500/20 text-red-700 p-3 rounded-md text-sm">
          {errorMessage}
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group Information
          </CardTitle>
          <CardDescription>
            Update your group's basic information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Group Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter group description"
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>
            Control who can join your group
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="private-group" className="text-sm font-medium">
                Private Group
              </label>
              <p className="text-sm text-muted-foreground">
                Private groups require a password to join
              </p>
            </div>
            <Switch
              id="private-group"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>
          
          {isPrivate && (
            <div className="space-y-2">
              <label htmlFor="group-password" className="text-sm font-medium">
                Group Password
              </label>
              <Input
                id="group-password"
                type="password"
                value={groupPassword}
                onChange={(e) => setGroupPassword(e.target.value)}
                placeholder="Enter password for the group"
              />
              <p className="text-xs text-muted-foreground">
                Members will need this password to join your group
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label htmlFor="require-approval" className="text-sm font-medium">
                Require Admin Approval
              </label>
              <p className="text-sm text-muted-foreground">
                New members must be approved by an admin
              </p>
            </div>
            <Switch
              id="require-approval"
              checked={requireApproval}
              onCheckedChange={setRequireApproval}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Privacy Settings
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Actions here cannot be undone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Group
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  group and remove all members and data associated with it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupSettings; 