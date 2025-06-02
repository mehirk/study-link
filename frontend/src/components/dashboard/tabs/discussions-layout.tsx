import DiscussionsSidebar from "@components/dashboard/discussions-sidebar";
import ChatDiscussionView from "@components/dashboard/chat-discussion-view";
import useChatStore from "@store/chat-store";
import { useMobile } from "@hooks/use-mobile";
import DiscussionInfoPanel from "@components/dashboard/discussion-info-panel";

const DiscussionsLayout = () => {
  const currentDiscussionId = useChatStore(
    (state) => state.currentDiscussionId
  );
  const isMobile = useMobile();

  const showSidebar = !currentDiscussionId || !isMobile;

  return (
    <div className="flex h-full w-full">
      {showSidebar && <DiscussionsSidebar />}

      <div className="flex w-full">
        {currentDiscussionId && (
          <>
            <div className="flex-1">
              <ChatDiscussionView />
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
