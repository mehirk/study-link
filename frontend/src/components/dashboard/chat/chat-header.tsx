import { ChevronLeft } from "lucide-react";
import { Button } from "@components/ui/button";
import useChatStore from "@store/chat-store";

interface ChatHeaderProps {
  discussionTitle: string;
}

export const ChatHeader = ({ discussionTitle }: ChatHeaderProps) => {
  return (
    <div className="px-3 bg-accent sm:px-4 py-2 sm:py-3 border-b flex-shrink-0">
      <div
        onClick={() => useChatStore.getState().setCurrentDiscussionId(null)}
        className="flex items-center gap-2 md:hidden mb-1"
      >
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold truncate">{discussionTitle}</h2>
      </div>
      <h2 className="text-xl font-semibold hidden md:block">
        {discussionTitle} - Discussion Chat
      </h2>
    </div>
  );
};
