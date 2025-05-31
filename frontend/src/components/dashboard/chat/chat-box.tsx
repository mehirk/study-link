import { isSameDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import CommentItem from "@components/dashboard/chat/comment-item";
import DateSeparator from "@components/dashboard/chat/date-separator";
import EditCommentForm from "@components/dashboard/chat/edit-comment-form";
import { getDateDisplay, getInitials } from "@lib/utils";
import useAuthStore from "@store/auth-store";
import useChatStore from "@store/chat-store";
import { useEffect, useRef } from "react";
import { useQuery as useZeroQuery, useZero } from "@rocicorp/zero/react";
import { Schema } from "../../../../../zero-syncer/generated/schema";
import type { Comment } from "@lib/api/discussion";
import { Loader2 } from "lucide-react";

export const Chat = () => {
  const user = useAuthStore((state) => state.user)!;
  const commentToEdit = useChatStore((state) => state.commentToEdit);
  const discussionId = useChatStore((state) => state.currentDiscussionId)!;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const z = useZero<Schema>();
  const discussionQuery = z.query.comment
    .where("discussionId", "=", discussionId)
    .where("deletedAt", "IS", null)
    .related("author");

  const [chat, chatDetails] = useZeroQuery(discussionQuery, {
    ttl: "forever",
  });

  const resultType = chatDetails.type;

  // Auto-scroll to bottom when comments change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const renderCommentElements = () => {
    if (resultType === "unknown") {
      return (
        <div className="flex pt-10 justify-center items-center h-full">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    if (!chat || chat.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No messages yet. Start the conversation!
        </div>
      );
    }

    return chat.reduce<React.ReactNode[]>((elements, comment, index) => {
      const currentDate = new Date(comment.createdAt);
      const isCurrentUser = comment.authorId === user?.id;

      // Check if this comment is from the same author as the previous one
      const prevComment = index > 0 ? chat[index - 1] : null;
      const isSameAuthorAsPrevious =
        prevComment && prevComment.authorId === comment.authorId;

      // Only show avatar for the first message in a sequence from the same author
      const showAvatar = !isSameAuthorAsPrevious;
      const isFirstInGroup = !isSameAuthorAsPrevious;

      // Add date separator if this is the first message or date changed since previous message
      if (
        index === 0 ||
        (prevComment &&
          !isSameDay(currentDate, new Date(prevComment.createdAt)))
      ) {
        elements.push(
          <DateSeparator
            key={`date-${comment.id}`}
            date={getDateDisplay(currentDate)}
          />
        );
      }

      // Add the comment - handle editing state
      if (commentToEdit === comment.id && isCurrentUser) {
        elements.push(
          <div
            key={comment.id}
            className={`flex ${
              isCurrentUser ? "justify-end" : "justify-start"
            } ${!isFirstInGroup ? "mt-0.5 sm:mt-1" : "mt-3 sm:mt-6"}`}
          >
            <div
              className={`flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] ${
                isCurrentUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {showAvatar ? (
                <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                  <AvatarImage
                    src={comment.author?.image ?? ""}
                    alt={comment.author?.name || ""}
                  />
                  <AvatarFallback className="text-xs sm:text-sm">
                    {getInitials(comment.author?.name || "")}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-8 sm:w-10 flex-shrink-0" />
              )}
              <div>
                {!isCurrentUser && isFirstInGroup && (
                  <div className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">
                    {comment.author?.name}
                  </div>
                )}
                <div
                  className={`rounded-lg p-2 sm:p-3 ${
                    isCurrentUser
                      ? "bg-background border border-primary/30"
                      : "bg-background border border-muted/50"
                  }`}
                >
                  <EditCommentForm initialContent={comment.content} />
                </div>
              </div>
            </div>
          </div>
        );
      } else {
        elements.push(
          <CommentItem
            key={comment.id}
            comment={comment as Comment}
            isCurrentUser={isCurrentUser}
            showAvatar={showAvatar}
            isFirstInGroup={isFirstInGroup}
          />
        );
      }

      return elements;
    }, []);
  };

  return (
    <div className="space-y-1 sm:space-y-2 py-2">
      {renderCommentElements()}
      <div ref={messagesEndRef} />
    </div>
  );
};
