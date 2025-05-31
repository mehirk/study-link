import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Send } from "lucide-react";
import useChatStore from "@store/chat-store";
import { useState } from "react";

const MessageInput = () => {
  const sendingComment = useChatStore((state) => state.sendingComment);
  const [message, setMessage] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        useChatStore.getState().sendNewMessage(message);
      }}
      className="flex gap-2"
    >
      <Input
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 h-11"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (message.trim()) {
              useChatStore.getState().sendNewMessage(message);
            }
          }
        }}
      />
      <Button
        type="submit"
        className="self-end h-11"
        disabled={sendingComment || !message.trim()}
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default MessageInput;
