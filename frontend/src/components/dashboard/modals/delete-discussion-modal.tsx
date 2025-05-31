import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@components/ui/credenza";
import { Button } from "@components/ui/button";

interface DeleteDiscussionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

const DeleteDiscussionModal = ({
  isOpen,
  onOpenChange,
  onConfirmDelete,
}: DeleteDiscussionModalProps) => {
  return (
    <Credenza open={isOpen} onOpenChange={onOpenChange}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Delete Discussion</CredenzaTitle>
          <CredenzaDescription>
            Are you sure you want to delete this discussion? This action cannot
            be undone.
          </CredenzaDescription>
        </CredenzaHeader>
        <CredenzaFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirmDelete}>
            Delete
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
};

export default DeleteDiscussionModal;
