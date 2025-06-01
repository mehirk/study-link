import { isSameDay } from "date-fns";
import CommentItem from "@components/dashboard/chat/comment-item";
import DateSeparator from "@components/dashboard/chat/date-separator";
import { getDateDisplay } from "@lib/utils";
import useAuthStore from "@store/auth-store";
import useChatStore from "@store/chat-store";
import { useEffect, useRef } from "react";
import { useQuery as useZeroQuery, useZero } from "@rocicorp/zero/react";
import { Schema } from "../../../../../zero-syncer/generated/schema";
import type { Comment } from "@lib/api/discussion";
import { Loader2 } from "lucide-react";

export const Chat = () => {
  const user = useAuthStore((state) => state.user)!;
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

  // Helper function to check if date changed between comments
  const hasDateChanged = (
    currentComment: Comment,
    previousComment: Comment | null
  ): boolean => {
    if (!previousComment) return true;

    const currentDate = new Date(currentComment.createdAt);
    const previousDate = new Date(previousComment.createdAt);

    return !isSameDay(currentDate, previousDate);
  };

  // Helper function to check if author changed between comments
  const hasAuthorChanged = (
    currentComment: Comment,
    previousComment: Comment | null
  ): boolean => {
    if (!previousComment) return true;
    return currentComment.authorId !== previousComment.authorId;
  };

  // Helper function to determine if avatar should be shown
  const shouldShowAvatar = (
    currentComment: Comment,
    previousComment: Comment | null
  ): boolean => {
    return (
      hasAuthorChanged(currentComment, previousComment) ||
      hasDateChanged(currentComment, previousComment)
    );
  };

  // Helper function to check if this is the first comment in a group
  const isFirstInGroup = (
    currentComment: Comment,
    previousComment: Comment | null
  ): boolean => {
    return shouldShowAvatar(currentComment, previousComment);
  };

  // Process a single comment and return rendered elements - this contains actual logic
  const processComment = (
    comment: Comment,
    index: number,
    comments: Comment[]
  ): React.ReactNode[] => {
    const elements: React.ReactNode[] = [];
    const previousComment = index > 0 ? comments[index - 1] : null;

    const isCurrentUser = comment.authorId === user?.id;
    const dateChanged = hasDateChanged(comment, previousComment);
    const showAvatar = shouldShowAvatar(comment, previousComment);
    const firstInGroup = isFirstInGroup(comment, previousComment);

    // Add date separator if needed
    if (dateChanged) {
      const currentDate = new Date(comment.createdAt);
      elements.push(
        <DateSeparator
          key={`date-${comment.id}`}
          date={getDateDisplay(currentDate)}
        />
      );
    }

    // Add comment item
    elements.push(
      <CommentItem
        key={comment.id}
        comment={comment as Comment}
        isCurrentUser={isCurrentUser}
        showAvatar={showAvatar}
        isFirstInGroup={firstInGroup}
      />
    );

    return elements;
  };

  // Loading state
  if (resultType === "unknown") {
    return (
      <div className="flex pt-10 justify-center items-center h-full">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Empty state
  if (!chat || chat.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No messages yet. Start the conversation!
      </div>
    );
  }

  const comments = chat as Comment[];

  return (
    <div className="space-y-1 sm:space-y-2 py-2">
      {comments.reduce<React.ReactNode[]>((allElements, comment, index) => {
        const commentElements = processComment(comment, index, comments);
        return [...allElements, ...commentElements];
      }, [])}
      <div ref={messagesEndRef} />
    </div>
  );
};
