import { ScrollArea } from "@components/ui/scroll-area";
import DeleteCommentModal from "@components/dashboard/modals/delete-comment-modal";
import MessageInput from "@components/dashboard/chat/message-input";
import useChatStore from "@store/chat-store";
import { ChatHeader } from "@components/dashboard/chat/chat-header";
import { Chat } from "@components/dashboard/chat/chat-box";
import { useRef } from "react";

interface ChatDiscussionViewProps {
  discussionTitle: string;
}

const ChatDiscussionView = ({ discussionTitle }: ChatDiscussionViewProps) => {
  const commentToDelete = useChatStore((state) => state.commentToDelete);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex flex-col h-full min-w-[40vw]">
      <ChatHeader discussionTitle={discussionTitle} />

      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea
          className="flex-1 min-h-0 max-h-[calc(100dvh-115px)] md:max-h-[calc(100dvh-300px)] px-2 sm:px-3"
          ref={scrollAreaRef}
        >
          <Chat />
        </ScrollArea>

        <div className="p-2 sm:p-3 border-t bg-background flex-shrink-0">
          <MessageInput />
        </div>
      </div>

      <DeleteCommentModal
        isOpen={!!commentToDelete}
        onOpenChange={() => useChatStore.getState().setCommentToDelete(null)}
        onConfirmDelete={() => useChatStore.getState().deleteComment()}
      />
    </div>
  );
};

export default ChatDiscussionView;
