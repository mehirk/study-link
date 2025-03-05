// import { authClient } from "./lib/auth-client";
import { ModeToggle } from "@components/mode-toggle";
import { SignupForm } from "./components/sign-up";

const App = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 gap-4">
      <SignupForm />
      <ModeToggle />
    </div>
  );
};

export default App;
