import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@components/ui/button";
import { Loader2, Send, Edit, Trash2, Check, X } from "lucide-react";
import { useToast } from "@components/ui/use-toast";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import {
  getDiscussion,
  addComment,
  deleteComment,
  updateComment,
  Discussion,
  Comment,
} from "@lib/api/discussion";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { ScrollArea } from "@components/ui/scroll-area";
import DeleteCommentModal from "./modals/DeleteCommentModal";
import { Input } from "@components/ui/input";
import { Skeleton } from "@components/ui/skeleton";

interface ChatDiscussionViewProps {
  groupId: number;
  discussionId: number;
  isAdmin: boolean;
  onCommentDeleted?: (discussionId: number, commentCount: number) => void;
  onUpdateDiscussion?: (discussion: Discussion) => void;
}

// Helper functions
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

// Helper function to format dates for message groups
const getDateDisplay = (date: Date): string => {
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "MMMM d, yyyy");
  }
};

// Loading skeleton component
const ChatSkeleton = () => (
  <div className="flex flex-col h-full min-w-[40vw]">
    <div className="px-4 py-3 border-b">
      <Skeleton className="h-7 w-24" />
    </div>

    <div className="flex-1 overflow-hidden flex flex-col">
      <ScrollArea className="flex-1 px-4 pt-4">
        <div className="space-y-6">
          {/* Date separator skeleton */}
          <div className="flex items-center justify-center my-4">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`flex ${
                index % 2 === 0 ? "justify-end" : "justify-start"
              } ${
                index > 0 && index % 2 === (index - 1) % 2 ? "mt-1" : "mt-6"
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  index % 2 === 0 ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Only show avatar for first message in a group */}
                {index === 0 || index % 2 !== (index - 1) % 2 ? (
                  <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                ) : (
                  <div className="w-9 flex-shrink-0" />
                )}

                <div>
                  {/* Only show name for others' messages at start of group */}
                  {index % 2 !== 0 &&
                    (index === 0 || index % 2 !== (index - 1) % 2) && (
                      <Skeleton className="h-3 w-24 mb-1" />
                    )}

                  <div className="flex flex-col">
                    <div
                      className={`flex items-center gap-2 ${
                        index % 2 === 0 ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Skeleton
                        className={`h-12 w-48 rounded-3xl ${
                          index % 2 === 0 ? "bg-primary/30" : ""
                        }`}
                      />
                      {/* Timestamp skeleton */}
                      <Skeleton className="h-3 w-12" />
                    </div>

                    {/* Action buttons for own messages */}
                    {index % 2 === 0 && (
                      <div className="flex justify-end gap-1 mt-1 px-1">
                        <Skeleton className="h-6 w-6 rounded-md" />
                        <Skeleton className="h-6 w-6 rounded-md" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Another date separator */}
          <div className="flex items-center justify-center my-4">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          {/* A few more message skeletons */}
          {[1, 2].map((index) => (
            <div
              key={`more-${index}`}
              className={`flex ${
                index % 2 === 0 ? "justify-start" : "justify-end"
              } mt-1`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  index % 2 === 1 ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {index === 1 ? (
                  <div className="w-9 flex-shrink-0" />
                ) : (
                  <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                )}

                <div>
                  <div className="flex flex-col">
                    <div
                      className={`flex items-center gap-2 ${
                        index % 2 === 1 ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Skeleton
                        className={`h-12 w-56 rounded-3xl ${
                          index % 2 === 1 ? "bg-primary/30" : ""
                        }`}
                      />
                      <Skeleton className="h-3 w-12" />
                    </div>

                    {index % 2 === 1 && (
                      <div className="flex justify-end gap-1 mt-1 px-1">
                        <Skeleton className="h-6 w-6 rounded-md" />
                        <Skeleton className="h-6 w-6 rounded-md" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto">
        <div className="flex gap-2">
          <Skeleton className="h-11 flex-1 rounded-full" />
          <Skeleton className="h-11 w-11 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

// Comment component
interface CommentItemProps {
  comment: Comment;
  isCurrentUser: boolean;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: number) => void;
  showAvatar: boolean;
  isFirstInGroup: boolean;
}

const CommentItem = ({
  comment,
  isCurrentUser,
  onEdit,
  onDelete,
  showAvatar,
  isFirstInGroup,
}: CommentItemProps) => (
  <div
    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} ${
      !isFirstInGroup ? "mt-1" : "mt-6"
    }`}
  >
    <div
      className={`flex gap-3 max-w-[80%] ${
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {showAvatar ? (
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage
            src={comment.author.image || ""}
            alt={comment.author.name}
          />
          <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
        </Avatar>
      ) : (
        <div className="w-9 flex-shrink-0" /> // Empty spacer to maintain alignment
      )}

      <div>
        {!isCurrentUser && isFirstInGroup && (
          <div className="text-xs font-medium text-muted-foreground mb-1">
            {comment.author.name}
          </div>
        )}
        <div className="flex flex-col">
          <div
            className={`flex items-center gap-2 ${
              isCurrentUser ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`rounded-3xl max-w-64 p-2.5 ${
                isCurrentUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap break-words">
                {comment.content}
              </div>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {format(new Date(comment.createdAt), "h:mm a")}
            </span>
          </div>

          {isCurrentUser && (
            <div className="flex justify-end gap-1 mt-1 px-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onEdit(comment)}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

// Date Separator Component
interface DateSeparatorProps {
  date: string;
}

const DateSeparator = ({ date }: DateSeparatorProps) => (
  <div className="flex items-center justify-center my-4">
    <div className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
      {date}
    </div>
  </div>
);

// Edit Comment Form
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

// Message Input Form
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
      className="flex-1 rounded-full h-11"
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
      className="self-end rounded-full h-11"
      disabled={isSubmitting || !value.trim()}
    >
      <Send className="h-4 w-4" />
    </Button>
  </form>
);

// Main component
const ChatDiscussionView = ({
  groupId,
  discussionId,
  onCommentDeleted,
  onUpdateDiscussion,
}: ChatDiscussionViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Consolidated state
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentState, setCommentState] = useState({
    newComment: "",
    editingCommentId: null as number | null,
    editedCommentContent: "",
    isSubmitting: false,
  });
  const [deleteState, setDeleteState] = useState({
    isDialogOpen: false,
    commentToDelete: null as number | null,
  });

  // Load discussion data
  const loadDiscussion = useCallback(async () => {
    if (!groupId || !discussionId) return;

    try {
      setLoading(true);
      const data = await getDiscussion(groupId, discussionId);
      setDiscussion(data);
    } catch (error) {
      console.error("Failed to load discussion:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load discussion. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [groupId, discussionId, toast]);

  useEffect(() => {
    loadDiscussion();
  }, [loadDiscussion]);

  // Simplified scroll to bottom logic
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollViewport) {
        // Use smooth scrolling behavior
        scrollViewport.scrollTo({
          top: scrollViewport.scrollHeight,
          behavior: "smooth",
        });
      }
    }

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Scroll on load and new messages
  useEffect(() => {
    if (!loading && discussion?.comments?.length) {
      // Use a small timeout to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
  }, [loading, discussion?.comments?.length, scrollToBottom]);

  // CRUD operations
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const { newComment } = commentState;

    if (!newComment.trim()) return;

    try {
      setCommentState((prev) => ({ ...prev, isSubmitting: true }));
      const comment = await addComment(groupId, discussionId, {
        content: newComment,
      });

      if (discussion) {
        const updatedComments = [...(discussion.comments || []), comment];
        const updatedDiscussion = {
          ...discussion,
          comments: updatedComments,
          _count: {
            ...discussion._count,
            comments: updatedComments.length,
          },
        };

        setDiscussion(updatedDiscussion);
        if (onUpdateDiscussion) {
          onUpdateDiscussion(updatedDiscussion);
        }
      }

      setCommentState((prev) => ({
        ...prev,
        newComment: "",
        isSubmitting: false,
      }));
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment. Please try again.",
      });
      setCommentState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleEditComment = (comment: Comment) => {
    // Only allow author to edit their own comments
    if (comment.authorId === user?.id) {
      setCommentState((prev) => ({
        ...prev,
        editingCommentId: comment.id,
        editedCommentContent: comment.content,
      }));
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    const { editedCommentContent } = commentState;

    if (!editedCommentContent.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Comment content is required.",
      });
      return;
    }

    try {
      setCommentState((prev) => ({ ...prev, isSubmitting: true }));
      const updated = await updateComment(groupId, discussionId, commentId, {
        content: editedCommentContent,
      });

      if (discussion?.comments) {
        const updatedDiscussion = {
          ...discussion,
          comments: discussion.comments.map((c) =>
            c.id === commentId ? updated : c
          ),
        };

        setDiscussion(updatedDiscussion);
        if (onUpdateDiscussion) {
          onUpdateDiscussion(updatedDiscussion);
        }
      }

      setCommentState((prev) => ({
        ...prev,
        editingCommentId: null,
        isSubmitting: false,
      }));
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update comment. Please try again.",
      });
      setCommentState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const openDeleteCommentDialog = (commentId: number) => {
    // Find the comment
    const comment = discussion?.comments?.find((c) => c.id === commentId);

    // Only allow author to delete their own comments
    if (comment && comment.authorId === user?.id) {
      setDeleteState({
        isDialogOpen: true,
        commentToDelete: commentId,
      });
    }
  };

  const handleDeleteComment = async () => {
    const { commentToDelete } = deleteState;
    if (!commentToDelete) return;

    try {
      await deleteComment(groupId, discussionId, commentToDelete);

      if (discussion?.comments) {
        const updatedComments = discussion.comments.filter(
          (c) => c.id !== commentToDelete
        );

        const updatedDiscussion = {
          ...discussion,
          comments: updatedComments,
          _count: {
            ...discussion._count,
            comments: updatedComments.length,
          },
        };

        setDiscussion(updatedDiscussion);
        if (onUpdateDiscussion) {
          onUpdateDiscussion(updatedDiscussion);
        }

        if (onCommentDeleted) {
          onCommentDeleted(discussionId, updatedComments.length);
        }
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete comment. Please try again.",
      });
    } finally {
      setDeleteState({
        isDialogOpen: false,
        commentToDelete: null,
      });
    }
  };

  if (loading) {
    return <ChatSkeleton />;
  }

  if (!discussion) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">Discussion not found</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[76vh] h-full min-w-[40vw]">
      <div className="px-4 py-3 border-b">
        <h2 className="text-xl font-semibold">Group Chat</h2>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea
          className="flex-1 px-4 pt-4 h-[calc(100%-80px)]"
          ref={scrollAreaRef}
          style={{ overflowY: "auto" }}
        >
          <div className="space-y-2 pb-4">
            {discussion.comments && discussion.comments.length > 0 ? (
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
                      prevComment && prevComment.authorId === comment.authorId;

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
                    if (commentState.editingCommentId === comment.id) {
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
                                isCurrentUser ? "flex-row-reverse" : "flex-row"
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
                                    content={commentState.editedCommentContent}
                                    onChange={(content) =>
                                      setCommentState((prev) => ({
                                        ...prev,
                                        editedCommentContent: content,
                                      }))
                                    }
                                    onSave={() =>
                                      handleUpdateComment(comment.id)
                                    }
                                    onCancel={() =>
                                      setCommentState((prev) => ({
                                        ...prev,
                                        editingCommentId: null,
                                      }))
                                    }
                                    isSubmitting={commentState.isSubmitting}
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
        </ScrollArea>

        <div className="p-4 mt-auto">
          <MessageInput
            value={commentState.newComment}
            onChange={(value) =>
              setCommentState((prev) => ({ ...prev, newComment: value }))
            }
            onSubmit={handleAddComment}
            isSubmitting={commentState.isSubmitting}
          />
        </div>
      </div>

      <DeleteCommentModal
        isOpen={deleteState.isDialogOpen}
        onOpenChange={(isOpen) =>
          setDeleteState((prev) => ({ ...prev, isDialogOpen: isOpen }))
        }
        onConfirmDelete={handleDeleteComment}
      />
    </div>
  );
};

export default ChatDiscussionView;
