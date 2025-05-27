import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Send } from "lucide-react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const MessageInput = ({
  value,
  onChange,
  onSubmit,
  isSubmitting,
}: MessageInputProps) => (
  <form onSubmit={onSubmit} className="flex gap-2">
    <Input
      placeholder="Type your message..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 h-11"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (value.trim()) {
            onSubmit(e);
          }
        }
      }}
    />
    <Button
      type="submit"
      className="self-end h-11"
      disabled={isSubmitting || !value.trim()}
    >
      <Send className="h-4 w-4" />
    </Button>
  </form>
);

export default MessageInput;
