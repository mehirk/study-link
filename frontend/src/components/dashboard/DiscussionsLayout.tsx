import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@components/ui/use-toast";
import {
  fetchGroupDiscussions,
  createDiscussion,
  getDiscussion,
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
  const [selectedDiscussion, setSelectedDiscussion] =
    useState<Discussion | null>(null);
  const [discussionLoading, setDiscussionLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Track previous groupId to detect changes
  const prevGroupIdRef = useRef<number | null>(null);

  const loadDiscussions = useCallback(async () => {
    if (!groupId) return;

    try {
      setLoading(true);
      setSelectedDiscussionId(null);
      setSelectedDiscussion(null);
      setDiscussions([]);
      const data = await fetchGroupDiscussions(groupId);

      setDiscussions(data);
      // Only set the selected discussion if there are discussions available
      if (data.length > 0) {
        setSelectedDiscussionId(data[0].id);
      }
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

  // Load the specific discussion when selectedDiscussionId changes
  const loadSelectedDiscussion = useCallback(async () => {
    if (!groupId || !selectedDiscussionId) {
      setSelectedDiscussion(null);
      return;
    }

    try {
      setDiscussionLoading(true);
      const data = await getDiscussion(groupId, selectedDiscussionId);
      setSelectedDiscussion(data);
    } catch (error) {
      console.error("Failed to load discussion:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load discussion details. Please try again.",
      });
    } finally {
      setDiscussionLoading(false);
    }
  }, [groupId, selectedDiscussionId, toast]);

  useEffect(() => {
    // Check if groupId has changed
    if (prevGroupIdRef.current !== groupId) {
      prevGroupIdRef.current = groupId;
      // Reset discussions when group changes
      loadDiscussions();
    } else {
      // If same group but refreshTrigger changed
      loadDiscussions();
    }
  }, [loadDiscussions, groupId, refreshTrigger]);

  // Effect to load selected discussion when selectedDiscussionId changes
  useEffect(() => {
    loadSelectedDiscussion();
  }, [loadSelectedDiscussion]);

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

    // Also update the selected discussion if it's the one that changed
    if (selectedDiscussion && selectedDiscussion.id === updatedDiscussion.id) {
      setSelectedDiscussion({
        ...selectedDiscussion,
        ...updatedDiscussion,
      });
    }
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
                discussion={selectedDiscussion}
                discussionLoading={discussionLoading}
              />
            </div>
            <div className="w-72 border-l">
              <DiscussionInfoPanel
                discussionId={selectedDiscussionId}
                groupId={groupId}
                isAdmin={isAdmin}
                discussion={selectedDiscussion}
                discussionLoading={discussionLoading}
                onUpdateDiscussion={handleUpdateDiscussion}
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
