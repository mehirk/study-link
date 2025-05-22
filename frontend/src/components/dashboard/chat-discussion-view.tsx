import { useState, useEffect, useRef } from "react";
import { useAuth } from "@hooks/use-auth";
import { useChat } from "@hooks/use-chat";
import { isSameDay } from "date-fns";
import { Discussion, Comment } from "@lib/api/discussion";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { ScrollArea } from "@components/ui/scroll-area";
import DeleteCommentModal from "@components/dashboard/modals/delete-comment-modal";
import { ChatSkeleton } from "@components/ui/chat-skeleton";
import CommentItem from "@components/dashboard/chat/comment-item";
import DateSeparator from "@components/dashboard/chat/date-separator";
import EditCommentForm from "@components/dashboard/chat/edit-comment-form";
import MessageInput from "@components/dashboard/chat/message-input";
import { getDateDisplay, getInitials } from "@components/dashboard/chat/utils";

interface ChatDiscussionViewProps {
  groupId: number;
  discussionId: number;
  isAdmin: boolean;
  discussion?: Discussion | null;
  discussionLoading?: boolean;
  onCommentDeleted?: (discussionId: number, commentCount: number) => void;
  onUpdateDiscussion?: (discussion: Discussion) => void;
}

// Main component
const ChatDiscussionView = ({
  groupId,
  discussionId,
  discussion,
  discussionLoading = false,
  onCommentDeleted,
  onUpdateDiscussion,
}: ChatDiscussionViewProps) => {
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    discussion,
    discussionLoading,
    onCommentDeleted,
    onUpdateDiscussion,
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
    <div className="flex flex-col h-[calc(100vh-180px)] min-w-[40vw]">
      <div className="px-4 py-3 border-b flex-shrink-0">
        <h2 className="text-xl font-semibold">Group Chat</h2>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 px-3 overflow-y-auto" ref={scrollAreaRef}>
          {loading ? (
            <ChatSkeleton />
          ) : (
            <div className="space-y-2">
              {discussion?.comments && discussion.comments.length > 0 ? (
                <>
                  {discussion.comments.reduce<React.ReactNode[]>(
                    (elements, comment, index) => {
                      const currentDate = new Date(comment.createdAt);
                      const isCurrentUser = comment.authorId === user?.id;

                      // Check if this comment is from the same author as the previous one
                      const prevComment =
                        index > 0 && discussion.comments
                          ? discussion.comments[index - 1]
                          : null;
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
                              } ${!isFirstInGroup ? "mt-1" : "mt-6"}`}
                            >
                              <div
                                className={`flex gap-3 max-w-[80%] ${
                                  isCurrentUser
                                    ? "flex-row-reverse"
                                    : "flex-row"
                                }`}
                              >
                                {showAvatar ? (
                                  <Avatar className="h-10 w-10 flex-shrink-0">
                                    <AvatarImage
                                      src={comment.author.image || ""}
                                      alt={comment.author.name}
                                    />
                                    <AvatarFallback>
                                      {getInitials(comment.author.name)}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <div className="w-10 flex-shrink-0" />
                                )}
                                <div>
                                  {!isCurrentUser && isFirstInGroup && (
                                    <div className="text-sm font-medium mb-1">
                                      {comment.author.name}
                                    </div>
                                  )}
                                  <div
                                    className={`rounded-lg p-3 ${
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
                              comment={comment}
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
                            comment={comment}
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

        <div className="p-3 border-t sticky bottom-0 bg-background flex-shrink-0">
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
