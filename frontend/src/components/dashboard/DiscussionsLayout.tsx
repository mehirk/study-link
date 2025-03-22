import { useState, useEffect, useCallback } from "react";
import { useToast } from "@components/ui/use-toast";
import {
  fetchGroupDiscussions,
  createDiscussion,
  Discussion,
} from "@lib/api/discussion";
import DiscussionsSidebar from "./DiscussionsSidebar";
import ChatDiscussionView from "./ChatDiscussionView";
import DiscussionInfoPanel from "./DiscussionInfoPanel";
import CreateDiscussionModal from "./modals/CreateDiscussionModal";

interface DiscussionsLayoutProps {
  groupId: number;
  isAdmin: boolean;
}

const DiscussionsLayout = ({ groupId, isAdmin }: DiscussionsLayoutProps) => {
  const { toast } = useToast();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState<
    number | null
  >(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadDiscussions = useCallback(async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      const data = await fetchGroupDiscussions(groupId);
      setDiscussions(data);
    } catch (error) {
      console.error("Failed to load discussions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load discussions. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, [groupId, toast]);

  useEffect(() => {
    loadDiscussions();
  }, [loadDiscussions, refreshTrigger]);

  const handleSelectDiscussion = (discussionId: number) => {
    setSelectedDiscussionId(discussionId);
  };

  const handleCreateDiscussion = async (title: string, content: string) => {
    try {
      const newDiscussion = await createDiscussion(groupId, {
        title,
        content: content || undefined,
      });
      await loadDiscussions();
      // Auto-select the newly created discussion
      setSelectedDiscussionId(newDiscussion.id);
      toast({
        title: "Success",
        description: "Discussion created successfully",
      });
    } catch (error) {
      console.error("Failed to create discussion:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create discussion. Please try again.",
      });
    }
  };

  const handleCommentDeleted = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleUpdateDiscussion = (updatedDiscussion: Discussion) => {
    setDiscussions((prevDiscussions) =>
      prevDiscussions.map((disc) =>
        disc.id === updatedDiscussion.id
          ? { ...disc, _count: updatedDiscussion._count }
          : disc
      )
    );
  };

  return (
    <div className="flex h-full">
      <DiscussionsSidebar
        discussions={discussions}
        selectedDiscussionId={selectedDiscussionId}
        onSelectDiscussion={handleSelectDiscussion}
        loading={loading}
        onNewDiscussion={() => setCreateDialogOpen(true)}
      />

      <div className="flex">
        {selectedDiscussionId ? (
          <>
            <div className="flex-1">
              <ChatDiscussionView
                groupId={groupId}
                discussionId={selectedDiscussionId}
                isAdmin={isAdmin}
                onCommentDeleted={handleCommentDeleted}
                onUpdateDiscussion={handleUpdateDiscussion}
              />
            </div>
            <div className="w-72 border-l">
              <DiscussionInfoPanel
                discussionId={selectedDiscussionId}
                groupId={groupId}
                isAdmin={isAdmin}
              />
            </div>
          </>
        ) : (
          <div className="h-full ml-96 w-full flex items-center justify-center text-muted-foreground">
            Nothing Yet 😔
          </div>
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
