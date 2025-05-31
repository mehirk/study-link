import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@components/ui/credenza";
import { Button } from "@components/ui/button";

interface DeleteCommentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

const DeleteCommentModal = ({
  isOpen,
  onOpenChange,
  onConfirmDelete,
}: DeleteCommentModalProps) => {
  return (
    <Credenza open={isOpen} onOpenChange={onOpenChange}>
      <CredenzaContent>
        <CredenzaHeader>
          <CredenzaTitle>Delete Comment</CredenzaTitle>
          <CredenzaDescription>
            Are you sure you want to delete this comment? This action cannot be
            undone.
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

export default DeleteCommentModal;
