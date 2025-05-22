import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Loader2, Check, X } from "lucide-react";

interface EditCommentFormProps {
  content: string;
  onChange: (content: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const EditCommentForm = ({
  content,
  onChange,
  onSave,
  onCancel,
  isSubmitting,
}: EditCommentFormProps) => (
  <div className="space-y-2">
    <Input
      value={content}
      onChange={(e) => onChange(e.target.value)}
      className="min-w-[200px] bg-background text-foreground border-muted-foreground/30"
    />
    <div className="flex justify-end gap-2">
      <Button
        size="icon"
        variant="ghost"
        onClick={onCancel}
        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100/30"
      >
        <X className="h-4 w-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={onSave}
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

export default EditCommentForm;
