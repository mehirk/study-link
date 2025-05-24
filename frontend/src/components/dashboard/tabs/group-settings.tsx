import { useState, useEffect } from "react";
import { Input } from "@components/ui/input";
import { Button } from "@components/ui/button";
import { Textarea } from "@components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Switch } from "@components/ui/switch";
import { Loader2, Trash2, Save, Users, Lock } from "lucide-react";
import { updateGroup, deleteGroup } from "@lib/api/group";
import DeleteGroupModal from "@components/dashboard/modals/delete-group-modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useGroupStore from "@store/group-store";
import { useToast } from "@components/ui/use-toast";

type GroupFormData = {
  name: string;
  description: string;
  isPrivate: boolean;
  password: string;
};

const GroupSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const group = useGroupStore((state) => state.currentGroup)!;
  const setCurrentGroup = useGroupStore((state) => state.setCurrentGroup);

  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    description: "",
    isPrivate: false,
    password: "",
  });
  const [initialData, setInitialData] = useState<GroupFormData>({
    name: "",
    description: "",
    isPrivate: false,
    password: "",
  });

  // Update group mutation
  const updateGroupMutation = useMutation({
    mutationFn: (data: GroupFormData) => {
      if (!group) throw new Error("Group not found");
      return updateGroup(group.id, {
        name: data.name,
        description: data.description,
        private: data.isPrivate,
        password: data.isPrivate ? data.password : undefined,
      });
    },
    onSuccess: () => {
      if (group) {
        queryClient.invalidateQueries({ queryKey: ["groups"] });
        setCurrentGroup({
          id: group.id,
          createdAt: group.createdAt,
          updatedAt: group.updatedAt,
          name: formData.name,
          description: formData.description,
          private: formData.isPrivate,
          password: formData.password,
        });
        setInitialData({ ...formData });
      }
    },
    onError: (error) => {
      console.error("Error updating group:", error);
      toast({
        title: "Error",
        description: "Failed to update group settings",
        variant: "destructive",
      });
    },
  });

  // Delete group mutation
  const deleteGroupMutation = useMutation({
    mutationFn: () => {
      if (!group) throw new Error("Group not found");
      return deleteGroup(group.id);
    },
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      console.error("Error deleting group:", error);
      toast({
        title: "Error",
        description: "Failed to delete group",
        variant: "destructive",
      });
    },
  });

  // Update state values when group changes
  useEffect(() => {
    if (group) {
      const newData = {
        name: group.name,
        description: group.description || "",
        isPrivate: Boolean(group.private),
        password: group.password || "",
      };
      setFormData(newData);
      setInitialData(newData);
    }
  }, [group]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const togglePrivate = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isPrivate: checked }));
  };

  // Check if any form values have changed from their original values
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Group name cannot be empty",
        variant: "destructive",
      });
      return false;
    }

    if (formData.isPrivate && !formData.password.trim()) {
      toast({
        title: "Validation Error",
        description: "Password is required for private groups",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      updateGroupMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    deleteGroupMutation.mutate();
  };

  return (
    <div className="space-y-6 w-full">
      <Card className="shadow-none">
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
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter group name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              className="shadow-sm"
              onChange={handleInputChange}
              placeholder="Enter group description"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>Control who can join your group</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-12">
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
              checked={formData.isPrivate}
              onCheckedChange={togglePrivate}
            />
          </div>

          {formData.isPrivate && (
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Group Password
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password for the group"
              />
              <p className="text-xs text-muted-foreground">
                Members will need this password to join your group
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={updateGroupMutation.isPending || !hasChanges}
        className="gap-2"
      >
        {updateGroupMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>

      <Card className="border-destructive shadow-none">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Actions here cannot be undone</CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteGroupModal
            onDelete={handleDelete}
            isDeleting={deleteGroupMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupSettings;
