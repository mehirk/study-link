import { useState } from "react";
import {
  Credenza,
  CredenzaContent,
  CredenzaHeader,
  CredenzaTitle,
} from "@components/ui/credenza";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Label } from "@components/ui/label";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (groupName: string, groupDescription: string) => void;
}

const CreateGroupModal = ({
  isOpen,
  onClose,
  onCreateGroup,
}: CreateGroupModalProps) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim()) {
      onCreateGroup(groupName, groupDescription);
      setGroupName("");
      setGroupDescription("");
      onClose();
    }
  };

  return (
    <Credenza open={isOpen} onOpenChange={onClose}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Create a New Group</CredenzaTitle>
        </CredenzaHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 sm:px-0">
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              type="text"
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="groupDescription">Description (Optional)</Label>
            <Textarea
              id="groupDescription"
              rows={3}
              value={groupDescription}
              className="text-base"
              onChange={(e) => setGroupDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3 pb-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Group</Button>
          </div>
        </form>
      </CredenzaContent>
    </Credenza>
  );
};

export default CreateGroupModal;
