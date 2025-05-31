import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@components/ui/credenza";
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
    <Credenza open={isOpen} onOpenChange={onClose}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>What would you like to do?</CredenzaTitle>
          <CredenzaDescription>
            Choose an option to proceed with your action.
          </CredenzaDescription>
        </CredenzaHeader>
        <div className="px-4 flex flex-col space-y-3 pt-2">
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
        <CredenzaFooter>
          <Button variant="outline" onClick={() => onClose()}>
            Cancel
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default GroupActionModal;
