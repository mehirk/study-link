import GroupDetails from "@components/dashboard/group-details";
import GroupSidebar from "@components/dashboard/group-sidebar";
import useGroupStore from "@store/group-store";

const Dashboard = () => {
  const currentGroup = useGroupStore((state) => state.currentGroup);
  return (
    <div className="flex min-h-[calc(100vh-55px)] w-full">
      <GroupSidebar />
      <div className="flex-1 min-w-0">{currentGroup && <GroupDetails />}</div>
    </div>
  );
};

export default Dashboard;
