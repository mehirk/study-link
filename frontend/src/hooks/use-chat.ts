import { useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "@components/ui/use-toast";
import {
  addComment as apiAddComment,
  deleteComment as apiDeleteComment,
  updateComment as apiUpdateComment,
  getDiscussion as apiGetDiscussion,
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
  const [lastCommentId, setLastCommentId] = useState<number | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set comments from the discussion prop
  useEffect(() => {
    if (discussion && discussion.comments) {
      setComments(discussion.comments);

      // Update lastCommentId for comparison during polling
      if (discussion.comments.length > 0) {
        const lastComment = discussion.comments[discussion.comments.length - 1];
        setLastCommentId(lastComment.id);
      }

      setLoading(false);
    } else {
      // If no comments in discussion, set empty array
      setComments([]);
      setLoading(discussionLoading);
    }
  }, [discussion, discussionLoading]);

  // Polling function to fetch latest discussion data
  const pollForNewComments = useCallback(async () => {
    if (!groupId || !discussionId) return;

    try {
      const latestDiscussion = await apiGetDiscussion(groupId, discussionId);

      // Check if there are new comments
      if (latestDiscussion.comments?.length) {
        const newLastComment =
          latestDiscussion.comments[latestDiscussion.comments.length - 1];

        // Only update if there are new comments
        if (!lastCommentId || newLastComment.id > lastCommentId) {
          setComments(latestDiscussion.comments);
          setLastCommentId(newLastComment.id);

          // Update parent component if callback exists
          if (onUpdateDiscussion) {
            onUpdateDiscussion(latestDiscussion);
          }
        }
      }
    } catch (error) {
      console.error("Failed to poll for new comments:", error);
    }
  }, [groupId, discussionId, lastCommentId, onUpdateDiscussion]);

  // Set up polling interval
  useEffect(() => {
    // Start polling when component mounts
    pollIntervalRef.current = setInterval(pollForNewComments, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pollForNewComments]);

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
