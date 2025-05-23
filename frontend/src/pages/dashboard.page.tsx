import GroupDetails from "@components/dashboard/group-details";
import GroupSidebar from "@components/dashboard/group-sidebar";

const Dashboard = () => {
  return (
    <div className="flex min-h-[calc(100vh-55px)] dashboard">
      <GroupSidebar />
      <div className="flex-1">
        <GroupDetails />
      </div>
    </div>
  );
};

export default Dashboard;
