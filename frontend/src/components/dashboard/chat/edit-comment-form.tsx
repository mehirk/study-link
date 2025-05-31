import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import useChatStore from "@store/chat-store";
import { Loader2, Check, X } from "lucide-react";
import { useState } from "react";

const EditCommentForm = ({ initialContent }: { initialContent: string }) => {
  const [content, setContent] = useState(initialContent);
  const isSubmitting = useChatStore((state) => state.sendingComment);
  return (
    <div className="space-y-2">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-w-[200px] bg-background text-foreground border-muted-foreground/30"
      />
      <div className="flex justify-end gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => useChatStore.getState().setCommentToEdit(null)}
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100/30"
        >
          <X className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => useChatStore.getState().updateMessage(content)}
          disabled={isSubmitting}
          className="h-8 w-8"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default EditCommentForm;
