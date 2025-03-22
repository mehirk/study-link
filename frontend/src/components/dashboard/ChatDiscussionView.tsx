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
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedCommentContent, setEditedCommentContent] = useState("");
  const [deleteCommentDialogOpen, setDeleteCommentDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

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

  // Scroll to bottom when new comments are added
  useEffect(() => {
    if (scrollAreaRef.current) {
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [discussion?.comments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const comment = await addComment(groupId, discussionId, {
        content: newComment,
      });

      // Update the local state with the new comment
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

      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteCommentDialog = (commentId: number) => {
    setCommentToDelete(commentId);
    setDeleteCommentDialogOpen(true);
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;

    try {
      await deleteComment(groupId, discussionId, commentToDelete);

      // Update the local state by removing the deleted comment
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
      }

      if (onCommentDeleted) {
        onCommentDeleted(discussionId, discussion?.comments?.length || 0);
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete comment. Please try again.",
      });
    } finally {
      setCommentToDelete(null);
      setDeleteCommentDialogOpen(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedCommentContent(comment.content);
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!editedCommentContent.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Comment content is required.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await updateComment(groupId, discussionId, commentId, {
        content: editedCommentContent,
      });

      // Update the local state with the updated comment
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

      setEditingCommentId(null);
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update comment. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
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
                      {index % 2 !== 0 && (
                        <Skeleton className="h-4 w-24 mb-1" />
                      )}
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
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 rounded-full h-11"
              />
              <Button
                type="submit"
                className="self-end rounded-full h-11"
                disabled={isSubmitting || !newComment.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">Discussion not found</h3>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-w-[40vw]">
      <div className="px-4 py-3 border-b">
        <h2 className="text-xl font-semibold">Group Chat</h2>
      </div>

      {/* Comments Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 px-4 pt-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {discussion.comments && discussion.comments.length > 0 ? (
              discussion.comments.map((comment) => {
                const isCurrentUser = comment.authorId === user?.id;

                return (
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
                          {editingCommentId === comment.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={editedCommentContent}
                                onChange={(e) =>
                                  setEditedCommentContent(e.target.value)
                                }
                                rows={3}
                                className="min-w-[200px] bg-background"
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={cancelEditComment}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    handleUpdateComment(comment.id)
                                  }
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? (
                                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  ) : (
                                    <Check className="h-3 w-3 mr-1" />
                                  )}
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-sm whitespace-pre-wrap break-words">
                                {comment.content}
                              </div>
                            </>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-1 px-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                            })}
                          </span>

                          {(isAdmin || comment.authorId === user?.id) && (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleEditComment(comment)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() =>
                                  openDeleteCommentDialog(comment.id)
                                }
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
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 mt-auto">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 rounded-full h-11"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (newComment.trim()) {
                    handleAddComment(e);
                  }
                }
              }}
            />
            <Button type="submit" className="self-end rounded-full h-11">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      <DeleteCommentModal
        isOpen={deleteCommentDialogOpen}
        onOpenChange={setDeleteCommentDialogOpen}
        onConfirmDelete={handleDeleteComment}
      />
    </div>
  );
};

export default ChatDiscussionView;
