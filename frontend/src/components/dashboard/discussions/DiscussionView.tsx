import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "@components/ui/button";
import { Loader2, ArrowLeft, Trash2, Send, Edit, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Separator } from "@components/ui/separator";
import { Textarea } from "@components/ui/textarea";
import { Input } from "@components/ui/input";
import { useToast } from "@components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import {
  getDiscussion,
  addComment,
  deleteComment,
  updateDiscussion,
  updateComment,
  Discussion,
  Comment,
} from "@lib/api/discussion";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { ScrollArea } from "@components/ui/scroll-area";
import DeleteCommentModal from "../modals/DeleteCommentModal";

interface DiscussionViewProps {
  groupId: number;
  discussionId: number;
  isAdmin: boolean;
  onBack: () => void;
  onCommentDeleted?: (discussionId: number, commentCount: number) => void;
}

const DiscussionView = ({
  groupId,
  discussionId,
  isAdmin,
  onBack,
  onCommentDeleted,
}: DiscussionViewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDiscussion, setEditedDiscussion] = useState({
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

  useEffect(() => {
    if (discussion) {
      setEditedDiscussion({
        title: discussion.title,
        content: discussion.content || "",
      });
    }
  }, [discussion]);

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

        setDiscussion({
          ...discussion,
          comments: updatedComments,
          _count: {
            ...discussion._count,
            comments: updatedComments.length,
          },
        });
      }

      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added successfully.",
      });
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

        setDiscussion({
          ...discussion,
          comments: updatedComments,
          _count: {
            ...discussion._count,
            comments: updatedComments.length,
          },
        });
      }

      toast({
        title: "Success",
        description: "Comment deleted successfully.",
      });

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

  const handleUpdateDiscussion = async () => {
    if (!editedDiscussion.title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Title is required.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const updated = await updateDiscussion(groupId, discussionId, {
        title: editedDiscussion.title,
        content: editedDiscussion.content || undefined,
      });

      setDiscussion({
        ...discussion!,
        title: updated.title,
        content: updated.content,
        updatedAt: updated.updatedAt,
      });

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Discussion updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update discussion:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update discussion. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
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
        setDiscussion({
          ...discussion,
          comments: discussion.comments.map((c) =>
            c.id === commentId ? updated : c
          ),
        });
      }

      setEditingCommentId(null);
      toast({
        title: "Success",
        description: "Comment updated successfully.",
      });
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
        <Button variant="outline" className="mt-4" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discussions
        </Button>
      </div>
    );
  }

  const canEditDiscussion = isAdmin || discussion.authorId === user?.id;

  return (
    <div className="space-y-4">
      <Button variant="outline" onClick={onBack}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Discussions
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar>
              <AvatarImage
                src={discussion.author.image || ""}
                alt={discussion.author.name}
              />
              <AvatarFallback>
                {getInitials(discussion.author.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    value={editedDiscussion.title}
                    onChange={(e) =>
                      setEditedDiscussion({
                        ...editedDiscussion,
                        title: e.target.value,
                      })
                    }
                    placeholder="Discussion title"
                    className="text-xl font-semibold"
                  />
                  <Textarea
                    value={editedDiscussion.content}
                    onChange={(e) =>
                      setEditedDiscussion({
                        ...editedDiscussion,
                        content: e.target.value,
                      })
                    }
                    placeholder="Discussion content"
                    rows={5}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateDiscussion}
                      disabled={isSubmitting}
                      size="sm"
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      size="sm"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <CardTitle className="text-xl">
                      {discussion.title}
                    </CardTitle>
                    {canEditDiscussion && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Posted by {discussion.author.name} ·{" "}
                    {formatDistanceToNow(new Date(discussion.createdAt), {
                      addSuffix: true,
                    })}
                    {discussion.updatedAt !== discussion.createdAt && (
                      <span> · Edited</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        {!isEditing && (
          <CardContent>
            <p className="whitespace-pre-wrap">
              {discussion.content || "No content provided."}
            </p>
          </CardContent>
        )}
      </Card>

      <Separator className="my-6" />

      <h3 className="text-lg font-medium">
        Comments ({discussion.comments?.length || 0})
      </h3>

      <ScrollArea className="h-[calc(100vh-500px)]">
        {discussion.comments && discussion.comments.length > 0 ? (
          <div className="space-y-4 pr-4">
            {discussion.comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={comment.author.image || ""}
                    alt={comment.author.name}
                  />
                  <AvatarFallback>
                    {getInitials(comment.author.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium">{comment.author.name}</span>{" "}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                        {comment.updatedAt !== comment.createdAt && (
                          <span> · Edited</span>
                        )}
                      </span>
                    </div>
                    {(isAdmin || comment.authorId === user?.id) && (
                      <div className="flex gap-1">
                        {editingCommentId === comment.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleUpdateComment(comment.id)}
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={cancelEditComment}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  {editingCommentId === comment.id ? (
                    <Textarea
                      value={editedCommentContent}
                      onChange={(e) => setEditedCommentContent(e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm">{comment.content}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        )}
      </ScrollArea>

      <div className="pt-4">
        <form onSubmit={handleAddComment} className="flex gap-2">
          <Textarea
            placeholder="Write a comment..."
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

      <DeleteCommentModal
        isOpen={deleteCommentDialogOpen}
        onOpenChange={setDeleteCommentDialogOpen}
        onConfirmDelete={handleDeleteComment}
      />
    </div>
  );
};

export default DiscussionView;
