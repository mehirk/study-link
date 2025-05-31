import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Credenza,
  CredenzaContent,
  CredenzaDescription,
  CredenzaFooter,
  CredenzaHeader,
  CredenzaTitle,
} from "@components/ui/credenza";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDiscussion: (title: string, content: string) => Promise<void>;
}

const CreateDiscussionModal = ({
  isOpen,
  onOpenChange,
  onCreateDiscussion,
}: CreateDiscussionModalProps) => {
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!newDiscussion.title.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateDiscussion(newDiscussion.title, newDiscussion.content);
      setNewDiscussion({ title: "", content: "" });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Credenza open={isOpen} onOpenChange={onOpenChange}>
      <CredenzaContent>
        <form onSubmit={handleSubmit}>
          <CredenzaHeader>
            <CredenzaTitle>Create New Discussion</CredenzaTitle>
            <CredenzaDescription>
              Start a new discussion in this group.
            </CredenzaDescription>
          </CredenzaHeader>
          <div className="space-y-4 px-4 sm:px-0">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter discussion title"
              value={newDiscussion.title}
              onChange={(e) =>
                setNewDiscussion({
                  ...newDiscussion,
                  title: e.target.value,
                })
              }
              className="col-span-3"
              required
            />
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="What would you like to discuss?"
              value={newDiscussion.content}
              className="text-base"
              onChange={(e) =>
                setNewDiscussion({
                  ...newDiscussion,
                  content: e.target.value,
                })
              }
              rows={5}
            />
          </div>
          <CredenzaFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Discussion
            </Button>
          </CredenzaFooter>
        </form>
      </CredenzaContent>
    </Credenza>
  );
};

export default CreateDiscussionModal;
