import GroupDetails from "@components/dashboard/group-details";
import GroupSidebar from "@components/dashboard/group-sidebar";
import useGroupStore from "@store/group-store";
import useChatStore from "@store/chat-store";
import { useMobile } from "@hooks/use-mobile";

const Dashboard = () => {
  const currentGroup = useGroupStore((state) => state.currentGroup);
  const currentDiscussionId = useChatStore(
    (state) => state.currentDiscussionId
  );
  const isMobile = useMobile();
  const showSidebar = !currentDiscussionId || !isMobile;

  return (
    <div className="flex min-h-[calc(100vh-55px)] w-full">
      {showSidebar && <GroupSidebar />}
      <div className="flex-1 min-w-0">{currentGroup && <GroupDetails />}</div>
    </div>
  );
};

export default Dashboard;
