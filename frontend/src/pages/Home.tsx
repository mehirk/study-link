import { AuthTabs } from "@components/auth-tabs";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-65px)] p-4">
      <AuthTabs />
    </div>
  );
};

export default Home; 