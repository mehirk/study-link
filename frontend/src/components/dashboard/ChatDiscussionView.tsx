import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@components/ui/button";
import { Loader2, Send, Edit, Trash2, Check } from "lucide-react";
import { Textarea } from "@components/ui/textarea";
import { useToast } from "@components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
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

// Loading skeleton component
const ChatSkeleton = () => (
  <div className="flex flex-col h-full min-w-[40vw]">
    <div className="px-4 py-3 border-b">
      <Skeleton className="h-7 w-24" />
    </div>

    <div className="flex-1 overflow-hidden flex flex-col">
      <ScrollArea className="flex-1 px-4 pt-4">
        <div className="space-y-6">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`flex ${
                index % 2 === 0 ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  index % 2 === 0 ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div>
                  {index % 2 !== 0 && <Skeleton className="h-4 w-24 mb-1" />}
                  <Skeleton
                    className={`h-16 w-60 rounded-lg ${
                      index % 2 === 0 ? "bg-primary/30" : ""
                    }`}
                  />
                  <div className="flex items-center justify-between mt-1 px-1">
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            disabled
            className="flex-1 rounded-full h-11"
          />
          <Button type="submit" className="self-end rounded-full h-11" disabled>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </div>
);

// Comment component
interface CommentItemProps {
  comment: Comment;
  isCurrentUser: boolean;
  isAdmin: boolean;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: number) => void;
}

const CommentItem = ({
  comment,
  isCurrentUser,
  isAdmin,
  onEdit,
  onDelete,
}: CommentItemProps) => (
  <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
    <div
      className={`flex gap-3 max-w-[80%] ${
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage
          src={comment.author.image || ""}
          alt={comment.author.name}
        />
        <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
      </Avatar>

      <div>
        {!isCurrentUser && (
          <div className="text-sm font-medium mb-1">{comment.author.name}</div>
        )}
        <div
          className={`rounded-lg p-3 ${
            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          <div className="text-sm whitespace-pre-wrap break-words">
            {comment.content}
          </div>
        </div>

        <div className="flex items-center justify-between mt-1 px-1">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>

          {(isAdmin || isCurrentUser) && (
            <div className="flex gap-2">
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
    <Textarea
      value={content}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="min-w-[200px] bg-background"
    />
    <div className="flex justify-end gap-2">
      <Button size="sm" variant="outline" onClick={onCancel}>
        Cancel
      </Button>
      <Button size="sm" onClick={onSave} disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="h-3 w-3 animate-spin mr-1" />
        ) : (
          <Check className="h-3 w-3 mr-1" />
        )}
        Save
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
  isAdmin,
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
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, []);

  // Scroll on load and new messages
  useEffect(() => {
    if (!loading && discussion?.comments?.length) {
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
    setCommentState((prev) => ({
      ...prev,
      editingCommentId: comment.id,
      editedCommentContent: comment.content,
    }));
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
    setDeleteState({
      isDialogOpen: true,
      commentToDelete: commentId,
    });
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
          <div className="space-y-6 pb-4">
            {discussion.comments && discussion.comments.length > 0 ? (
              discussion.comments.map((comment) => {
                const isCurrentUser = comment.authorId === user?.id;

                return commentState.editingCommentId === comment.id ? (
                  <div
                    key={comment.id}
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex gap-3 max-w-[80%] ${
                        isCurrentUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage
                          src={comment.author.image || ""}
                          alt={comment.author.name}
                        />
                        <AvatarFallback>
                          {getInitials(comment.author.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        {!isCurrentUser && (
                          <div className="text-sm font-medium mb-1">
                            {comment.author.name}
                          </div>
                        )}
                        <div
                          className={`rounded-lg p-3 ${
                            isCurrentUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
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
                            onSave={() => handleUpdateComment(comment.id)}
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
                ) : (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    isCurrentUser={isCurrentUser}
                    isAdmin={isAdmin}
                    onEdit={handleEditComment}
                    onDelete={openDeleteCommentDialog}
                  />
                );
              })
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
