import { useState, useEffect } from "react";
import { useToast } from "@components/ui/use-toast";
import {
  fetchGroupDiscussions,
  createDiscussion,
  getDiscussion,
  Discussion,
} from "@lib/api/discussion";
import DiscussionsSidebar from "@components/dashboard/discussions-sidebar";
import DiscussionInfoPanel from "@components/dashboard/discussion-info-panel";
import CreateDiscussionModal from "@components/dashboard/modals/create-discussion-modal";
import ChatDiscussionView from "@components/dashboard/chat-discussion-view";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useGroupStore from "@store/group-store";

const DiscussionsLayout = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isAdmin = useGroupStore((state) => state.isAdmin);
  const groupId = useGroupStore((state) => state.currentGroup?.id) as number;
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<
    number | null
  >(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Reset selectedDiscussionId whenever groupId changes
  useEffect(() => {
    setSelectedDiscussionId(null);
  }, [groupId]);

  // Query for fetching discussions list
  const { data: discussions = [], isLoading: discussionsLoading } = useQuery({
    queryKey: ["discussions", groupId],
    queryFn: async () => {
      try {
        return await fetchGroupDiscussions(groupId);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load discussions. Please try again.",
        });
        throw error;
      }
    },
    enabled: !!groupId,
  });

  // Auto-select first discussion when discussions load and none is selected
  useEffect(() => {
    if (discussions.length > 0 && !selectedDiscussionId) {
      setSelectedDiscussionId(discussions[0].id);
    }
  }, [discussions, selectedDiscussionId]);

  // Query for fetching selected discussion details
  const { data: selectedDiscussion, isLoading: discussionDetailsLoading } =
    useQuery({
      queryKey: ["discussion-details", groupId, selectedDiscussionId],
      queryFn: async () => {
        try {
          if (!groupId || !selectedDiscussionId) {
            throw new Error("Group ID or Discussion ID is missing");
          }
          return await getDiscussion(groupId, selectedDiscussionId);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load discussion details. Please try again.",
          });
          throw error;
        }
      },
      enabled:
        !!groupId &&
        !!selectedDiscussionId &&
        discussions.some((d) => d.id === selectedDiscussionId),
    });

  // Mutation for creating new discussions
  const createDiscussionMutation = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      createDiscussion(groupId, {
        title,
        content: content || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions", groupId] });
      toast({
        title: "Success",
        description: "Discussion created successfully",
      });
      setCreateDialogOpen(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create discussion. Please try again.",
      });
    },
  });

  const handleSelectDiscussion = (discussionId: number) => {
    setSelectedDiscussionId(discussionId);
  };

  const handleCreateDiscussion = async (title: string, content: string) => {
    createDiscussionMutation.mutate({ title, content });
  };

  const handleCommentDeleted = () => {
    queryClient.invalidateQueries({
      queryKey: ["discussion", groupId, selectedDiscussionId],
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

  // Compute loading state
  const loading = discussionsLoading || discussionDetailsLoading;

  return (
    <div className="flex h-full w-full">
      <DiscussionsSidebar
        discussions={discussions}
        selectedDiscussionId={selectedDiscussionId}
        onSelectDiscussion={handleSelectDiscussion}
        onNewDiscussion={() => setCreateDialogOpen(true)}
      />

      <div className="flex w-full">
        {selectedDiscussionId && (
          <>
            <div className="flex-1">
              <ChatDiscussionView
                groupId={groupId}
                discussionId={selectedDiscussionId}
                isAdmin={isAdmin}
                onCommentDeleted={handleCommentDeleted}
                onUpdateDiscussion={handleUpdateDiscussion}
                discussion={selectedDiscussion}
                discussionLoading={loading}
              />
            </div>
            <div className="min-w-80 max-w-80 shrink-0 border-l">
              <DiscussionInfoPanel
                discussionId={selectedDiscussionId}
                groupId={groupId}
                isAdmin={isAdmin}
                discussion={selectedDiscussion}
                discussionLoading={loading}
                onUpdateDiscussion={handleUpdateDiscussion}
              />
            </div>
          </>
        )}
      </div>

      <CreateDiscussionModal
        isOpen={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateDiscussion={handleCreateDiscussion}
      />
    </div>
  );
};

export default DiscussionsLayout;
