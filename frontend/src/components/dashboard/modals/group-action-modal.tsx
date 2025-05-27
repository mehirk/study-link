import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { Button } from "@components/ui/button";
import { UserPlus, Users } from "lucide-react";

interface GroupActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: () => void;
  onJoinGroup: () => void;
}

const GroupActionModal = ({
  isOpen,
  onClose,
  onCreateGroup,
  onJoinGroup,
}: GroupActionModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>What would you like to do?</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-3 pt-2">
          <Button
            onClick={() => {
              onClose();
              onCreateGroup();
            }}
            className="w-full justify-start"
            size="lg"
          >
            <Users className="mr-2 h-4 w-4" />
            Create a new group
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              onJoinGroup();
            }}
            className="w-full justify-start"
            size="lg"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Join existing group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupActionModal;
