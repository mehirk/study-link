import { useEffect } from "react";
import { useToast } from "@components/ui/use-toast";
import { fetchGroupDiscussions, getDiscussion } from "@lib/api/discussion";
import DiscussionsSidebar from "@components/dashboard/discussions-sidebar";
import DiscussionInfoPanel from "@components/dashboard/discussion-info-panel";
import ChatDiscussionView from "@components/dashboard/chat-discussion-view";
import { useQuery } from "@tanstack/react-query";
import useGroupStore from "@store/group-store";
import useChatStore from "@store/chat-store";

const DiscussionsLayout = () => {
  const { toast } = useToast();
  const groupId = useGroupStore((state) => state.currentGroup?.id)!;
  const currentDiscussionId = useChatStore(
    (state) => state.currentDiscussionId
  );
  const setCurrentDiscussionId = useChatStore(
    (state) => state.setCurrentDiscussionId
  );

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
        console.error(error);
      }
    },
  });

  // Auto-select first discussion when discussions load and none is selected
  useEffect(() => {
    if (discussions.length > 0 && !currentDiscussionId) {
      setCurrentDiscussionId(discussions[0].id);
    }
  }, [discussions, currentDiscussionId, setCurrentDiscussionId]);

  // Query for fetching selected discussion details
  const { data: selectedDiscussion, isLoading: discussionDetailsLoading } =
    useQuery({
      queryKey: ["discussion-details", groupId, currentDiscussionId],
      queryFn: async () => {
        try {
          return await getDiscussion(groupId, currentDiscussionId!);
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load discussion details. Please try again.",
          });
          console.error(error);
        }
      },
      enabled:
        !!currentDiscussionId &&
        !!discussions.find((d) => d.id === currentDiscussionId),
    });

  return (
    <div className="flex h-full w-full">
      <DiscussionsSidebar
        loading={discussionsLoading}
        discussions={discussions}
      />

      <div className="flex w-full">
        {currentDiscussionId && !discussionsLoading && (
          <>
            <div className="flex-1">
              <ChatDiscussionView
                discussion={selectedDiscussion}
                discussionLoading={discussionDetailsLoading}
              />
            </div>
            <div className="min-w-80 max-w-80 shrink-0 border-l">
              <DiscussionInfoPanel />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DiscussionsLayout;
