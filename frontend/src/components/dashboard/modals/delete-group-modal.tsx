import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@components/ui/credenza";
import { Button } from "@components/ui/button";

interface DeleteGroupModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

const DeleteGroupModal = ({
  isOpen,
  onOpenChange,
  onConfirmDelete,
}: DeleteGroupModalProps) => {
  return (
    <Credenza open={isOpen} onOpenChange={onOpenChange}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Delete Group</CredenzaTitle>
          <CredenzaDescription>
            Are you sure you want to delete this group? This action cannot be
            undone and will remove all discussions and comments within the
            group.
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete}>
            Delete Group
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default DeleteGroupModal;
