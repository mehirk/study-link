import { useEffect } from "react";
import { useToast } from "@components/ui/use-toast";
import { fetchGroupDiscussions } from "@lib/api/discussion";
import DiscussionsSidebar from "@components/dashboard/discussions-sidebar";
import ChatDiscussionView from "@components/dashboard/chat-discussion-view";
import { useQuery } from "@tanstack/react-query";
import useGroupStore from "@store/group-store";
import useChatStore from "@store/chat-store";
import { useMobile } from "@hooks/use-mobile";
import DiscussionInfoPanel from "@components/dashboard/discussion-info-panel";

const DiscussionsLayout = () => {
  const { toast } = useToast();
  const groupId = useGroupStore((state) => state.currentGroupId)!;
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

  const isMobile = useMobile();

  // Auto-select first discussion when discussions load and none is selected (desktop only)
  useEffect(() => {
    if (discussions.length > 0 && !currentDiscussionId && !isMobile) {
      setCurrentDiscussionId(discussions[0].id);
    }
  }, [discussions, currentDiscussionId, setCurrentDiscussionId, isMobile]);

  const showSidebar = !currentDiscussionId || !isMobile;

  return (
    <div className="flex h-full w-full">
      {showSidebar && (
        <DiscussionsSidebar
          loading={discussionsLoading}
          discussions={discussions}
        />
      )}

      <div className="flex w-full">
        {currentDiscussionId && !discussionsLoading && (
          <>
            <div className="flex-1">
              <ChatDiscussionView
                discussionTitle={
                  discussions.find(
                    (discussion) => discussion.id === currentDiscussionId
                  )?.title || ""
                }
              />
            </div>
            {!isMobile && (
              <div className="hidden lg:block w-68 lg:w-72 shrink-0 lg:border-l">
                <DiscussionInfoPanel />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DiscussionsLayout;
