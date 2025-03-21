import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@components/ui/button";
import { Loader2, Send, Edit, Trash2, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
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
import { Separator } from "@components/ui/separator";

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
  const [editingDiscussionInfo, setEditingDiscussionInfo] = useState(false);
  const [editedDiscussionInfo, setEditedDiscussionInfo] = useState({
    title: "",
    content: "",
  });
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
      setEditedDiscussionInfo({
        title: data.title,
        content: data.content || "",
      });
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a comment.",
      });
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
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
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

  const canEditDiscussion = isAdmin || discussion.authorId === user?.id;

  return (
    <div className="flex flex-col h-full">
      {/* Discussion Info Card */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarImage
                  src={discussion.author.image || ""}
                  alt={discussion.author.name}
                />
                <AvatarFallback>
                  {getInitials(discussion.author.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                {editingDiscussionInfo ? (
                  <Input
                    value={editedDiscussionInfo.title}
                    onChange={(e) =>
                      setEditedDiscussionInfo({
                        ...editedDiscussionInfo,
                        title: e.target.value,
                      })
                    }
                    className="mb-2"
                  />
                ) : (
                  <CardTitle>{discussion.title}</CardTitle>
                )}
                <div className="text-sm text-muted-foreground mt-1">
                  Started by {discussion.author.name} ·{" "}
                  {formatDistanceToNow(new Date(discussion.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>

            {canEditDiscussion && (
              <>
                {editingDiscussionInfo ? (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setEditingDiscussionInfo(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={() => {
                        // Handle saving edited info
                        setEditingDiscussionInfo(false);
                      }}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setEditingDiscussionInfo(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </CardHeader>
        {!editingDiscussionInfo ? (
          discussion.content && (
            <CardContent>
              <p className="text-sm">{discussion.content}</p>
            </CardContent>
          )
        ) : (
          <CardContent>
            <Textarea
              value={editedDiscussionInfo.content}
              onChange={(e) =>
                setEditedDiscussionInfo({
                  ...editedDiscussionInfo,
                  content: e.target.value,
                })
              }
              placeholder="Discussion description"
              rows={3}
            />
          </CardContent>
        )}
      </Card>

      <Separator className="my-2" />

      {/* Comments Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="text-sm font-medium mb-2">
          {discussion.comments?.length || 0} Comments
        </div>

        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
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
                      className={`flex gap-2 max-w-[80%] ${
                        isCurrentUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage
                          src={comment.author.image || ""}
                          alt={comment.author.name}
                        />
                        <AvatarFallback>
                          {getInitials(comment.author.name)}
                        </AvatarFallback>
                      </Avatar>

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
                                onClick={() => handleUpdateComment(comment.id)}
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
                            <div className="text-sm">{comment.content}</div>
                            <div className="text-xs mt-1 flex justify-between items-center">
                              <span
                                className={
                                  isCurrentUser
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                }
                              >
                                {formatDistanceToNow(
                                  new Date(comment.createdAt),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </span>

                              {(isAdmin || comment.authorId === user?.id) && (
                                <div className="flex gap-1">
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
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No comments yet. Start the conversation!
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="mt-4">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button
              type="submit"
              className="self-end"
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
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
