import { useState, useEffect, useRef } from "react";
import { useChat } from "@hooks/use-chat";
import { isSameDay } from "date-fns";
import { Discussion, Comment } from "@lib/api/discussion";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { ScrollArea } from "@components/ui/scroll-area";
import DeleteCommentModal from "@components/dashboard/modals/delete-comment-modal";
import CommentItem from "@components/dashboard/chat/comment-item";
import DateSeparator from "@components/dashboard/chat/date-separator";
import EditCommentForm from "@components/dashboard/chat/edit-comment-form";
import MessageInput from "@components/dashboard/chat/message-input";
import { getDateDisplay, getInitials } from "@lib/utils";
import { ChevronLeft, Loader2 } from "lucide-react";
import useAuthStore from "@store/auth-store";
import useGroupStore from "@store/group-store";
import useChatStore from "@store/chat-store";
import { useQueryClient } from "@tanstack/react-query";
import { Schema } from "../../../../zero-syncer/generated/schema";
import { useQuery as useZeroQuery, useZero } from "@rocicorp/zero/react";
import { Button } from "@components/ui/button";

interface ChatDiscussionViewProps {
  discussionTitle: string;
}
const ChatDiscussionView = ({ discussionTitle }: ChatDiscussionViewProps) => {
  const user = useAuthStore((state) => state.user);
  const groupId = useGroupStore((state) => state.currentGroup?.id)!;
  const discussionId = useChatStore((state) => state.currentDiscussionId)!;
  const queryClient = useQueryClient();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const z = useZero<Schema>();

  const discussionQuery = z.query.comment
    .where("discussionId", "=", discussionId)
    .where("deletedAt", "IS", null)
    .related("author");

  const [chat] = useZeroQuery(discussionQuery, {
    ttl: "forever",
  });

  const handleCommentDeleted = () => {
    queryClient.invalidateQueries({
      queryKey: ["discussion", groupId, discussionId],
    });
  };

  const handleUpdateDiscussion = (updatedDiscussion: Discussion) => {
    // Update both queries in one go
    queryClient.setQueryData<Discussion>(
      ["discussion-details", groupId, updatedDiscussion.id],
      updatedDiscussion
    );

    queryClient.setQueryData<Discussion[]>(
      ["discussions", groupId],
      (oldData) => {
        if (!oldData) return [];
        return oldData.map((disc) =>
          disc.id === updatedDiscussion.id
            ? { ...disc, _count: updatedDiscussion._count }
            : disc
        );
      }
    );
  };
  // Use the chat discussion hook
  const {
    comments,
    loading,
    isSubmitting,
    addComment,
    updateComment,
    deleteComment,
  } = useChat({
    groupId,
    discussionId,
    onCommentDeleted: handleCommentDeleted,
    onUpdateDiscussion: handleUpdateDiscussion,
  });

  // Local state for UI components
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [newComment, setNewComment] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  // Scroll to bottom when comments change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  // Handle comment submission
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await addComment(newComment);
    setNewComment("");
  };

  // Handle comment editing
  const handleEditComment = (comment: Comment) => {
    // Only allow author to edit their own comments
    if (comment.authorId === user?.id) {
      setEditingComment(comment.id);
      setEditContent(comment.content);
    }
  };

  // Handle comment update
  const handleUpdateComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    const result = await updateComment(commentId, editContent);
    if (result) {
      setEditingComment(null);
    }
  };

  // Handle opening delete dialog
  const openDeleteCommentDialog = (commentId: number) => {
    // Only allow author to delete their own comments
    const comment = comments.find((c) => c.id === commentId);

    if (comment && comment.authorId === user?.id) {
      setDeleteDialogOpen(true);
      setCommentToDelete(commentId);
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    const success = await deleteComment(commentToDelete);
    if (success) {
      setDeleteDialogOpen(false);
      setCommentToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full min-w-[40vw]">
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

      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea
          className="flex-1 min-h-0 max-h-[calc(100dvh-115px)] md:max-h-[calc(100dvh-300px)] px-2 sm:px-3"
          ref={scrollAreaRef}
        >
          {loading ? (
            <div className="flex items-center justify-center h-64 sm:h-96 w-full">
              <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-1 sm:space-y-2 py-2">
              {chat && chat.length > 0 ? (
                <>
                  {chat.reduce<React.ReactNode[]>(
                    (elements, comment, index) => {
                      const currentDate = new Date(comment.createdAt);
                      const isCurrentUser = comment.authorId === user?.id;

                      // Check if this comment is from the same author as the previous one
                      const prevComment =
                        index > 0 && chat ? chat[index - 1] : null;
                      const isSameAuthorAsPrevious =
                        prevComment &&
                        prevComment.authorId === comment.authorId;

                      // Only show avatar for the first message in a sequence from the same author
                      const showAvatar = !isSameAuthorAsPrevious;
                      const isFirstInGroup = !isSameAuthorAsPrevious;

                      // Add date separator if this is the first message or date changed since previous message
                      if (
                        index === 0 ||
                        (prevComment &&
                          !isSameDay(
                            currentDate,
                            new Date(prevComment.createdAt)
                          ))
                      ) {
                        elements.push(
                          <DateSeparator
                            key={`date-${comment.id}`}
                            date={getDateDisplay(currentDate)}
                          />
                        );
                      }

                      // Add the comment
                      if (editingComment === comment.id) {
                        if (isCurrentUser) {
                          elements.push(
                            <div
                              key={comment.id}
                              className={`flex ${
                                isCurrentUser ? "justify-end" : "justify-start"
                              } ${!isFirstInGroup ? "mt-0.5 sm:mt-1" : "mt-3 sm:mt-6"}`}
                            >
                              <div
                                className={`flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] ${
                                  isCurrentUser
                                    ? "flex-row-reverse"
                                    : "flex-row"
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
                                    <EditCommentForm
                                      content={editContent}
                                      onChange={(content) =>
                                        setEditContent(content)
                                      }
                                      onSave={() =>
                                        handleUpdateComment(comment.id)
                                      }
                                      onCancel={() => setEditingComment(null)}
                                      isSubmitting={isSubmitting}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        } else {
                          // If not the author, just show the regular comment without edit form
                          elements.push(
                            <CommentItem
                              key={comment.id}
                              comment={{
                                ...comment,
                                author: comment.author
                                  ? {
                                      ...comment.author,
                                      image: comment.author.image ?? undefined,
                                    }
                                  : undefined,
                              }}
                              isCurrentUser={isCurrentUser}
                              onEdit={handleEditComment}
                              onDelete={openDeleteCommentDialog}
                              showAvatar={showAvatar}
                              isFirstInGroup={isFirstInGroup}
                            />
                          );
                        }
                      } else {
                        elements.push(
                          <CommentItem
                            key={comment.id}
                            comment={{
                              ...comment,
                              author: comment.author
                                ? {
                                    ...comment.author,
                                    image: comment.author.image ?? undefined,
                                  }
                                : undefined,
                            }}
                            isCurrentUser={isCurrentUser}
                            onEdit={handleEditComment}
                            onDelete={openDeleteCommentDialog}
                            showAvatar={showAvatar}
                            isFirstInGroup={isFirstInGroup}
                          />
                        );
                      }

                      return elements;
                    },
                    []
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No messages yet. Start the conversation!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="p-2 sm:p-3 border-t bg-background flex-shrink-0">
          <MessageInput
            value={newComment}
            onChange={(value) => setNewComment(value)}
            onSubmit={handleAddComment}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      <DeleteCommentModal
        isOpen={deleteDialogOpen}
        onOpenChange={(isOpen) => setDeleteDialogOpen(isOpen)}
        onConfirmDelete={handleDeleteComment}
      />
    </div>
  );
};

export default ChatDiscussionView;
