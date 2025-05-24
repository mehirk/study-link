import { useState, useEffect } from "react";
import { useToast } from "@components/ui/use-toast";
import {
  addComment as apiAddComment,
  deleteComment as apiDeleteComment,
  updateComment as apiUpdateComment,
  Discussion,
  Comment,
} from "@lib/api/discussion";

interface UseChatDiscussionProps {
  groupId: number;
  discussionId: number;
  discussion?: Discussion | null;
  discussionLoading?: boolean;
  onCommentDeleted?: (discussionId: number, commentCount: number) => void;
  onUpdateDiscussion?: (discussion: Discussion) => void;
}

export function useChat({
  groupId,
  discussionId,
  discussion,
  discussionLoading = false,
  onCommentDeleted,
  onUpdateDiscussion,
}: UseChatDiscussionProps) {
  const { toast } = useToast();

  // State
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set comments from the discussion prop
  useEffect(() => {
    if (discussion && discussion.comments) {
      setComments(discussion.comments);
      setLoading(false);
    } else {
      // If no comments in discussion, set empty array
      setComments([]);
      setLoading(discussionLoading);
    }
  }, [discussion, discussionLoading]);

  // Add comment
  const addComment = async (content: string) => {
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      const comment = await apiAddComment(groupId, discussionId, {
        content,
      });

      // Update local comments state
      setComments((prevComments) => [...prevComments, comment]);

      // Update both count AND comments array in parent component
      if (onUpdateDiscussion && discussion) {
        onUpdateDiscussion({
          ...discussion,
          comments: [...(discussion.comments || []), comment],
          _count: {
            ...discussion._count,
            comments: (discussion._count?.comments || 0) + 1,
          },
        });
      }

      setIsSubmitting(false);
      return comment;
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment. Please try again.",
      });
      setIsSubmitting(false);
      return null;
    }
  };

  // Update comment
  const updateComment = async (commentId: number, content: string) => {
    if (!content.trim()) {
      return null;
    }

    try {
      setIsSubmitting(true);
      const updated = await apiUpdateComment(groupId, discussionId, commentId, {
        content,
      });

      // Update the local comments array
      setComments((prevComments) =>
        prevComments.map((c) => (c.id === commentId ? updated : c))
      );

      setIsSubmitting(false);
      return updated;
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update comment. Please try again.",
      });
      setIsSubmitting(false);
      return null;
    }
  };

  // Delete comment
  const deleteComment = async (commentId: number) => {
    try {
      await apiDeleteComment(groupId, discussionId, commentId);

      // Update local comments array
      setComments((prevComments) =>
        prevComments.filter((c) => c.id !== commentId)
      );

      // Update comment count in parent component
      if (onUpdateDiscussion && discussion) {
        onUpdateDiscussion({
          ...discussion,
          _count: {
            ...discussion._count,
            comments: Math.max(0, (discussion._count?.comments || 1) - 1),
          },
        });
      }

      // Notify parent component
      if (onCommentDeleted) {
        onCommentDeleted(discussionId, comments.length - 1);
      }

      return true;
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete comment. Please try again.",
      });
      return false;
    }
  };

  return {
    comments,
    loading,
    isSubmitting,
    addComment,
    updateComment,
    deleteComment,
  };
}
