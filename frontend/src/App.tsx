// import { authClient } from "./lib/auth-client";
import { SignupForm } from "@components/sign-up";
import { ThemeProvider } from "@components/theme-provider";
import { ModeToggle } from "@components/mode-toggle";

const App = () => {
  return (
    <ThemeProvider>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 gap-4">
        <ModeToggle />
        <SignupForm />
      </div>
    </ThemeProvider>
  );
};

export default App;
