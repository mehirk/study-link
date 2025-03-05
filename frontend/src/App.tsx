// import { authClient } from "./lib/auth-client";
import { ModeToggle } from "@components/mode-toggle";
import { SignupForm } from "./components/sign-up";
import { ThemeProvider } from "@components/theme-provider";

const App = () => {
  return (
    <ThemeProvider>
      <div className="flex flex-row items-center justify-center h-screen gap-4">
        <ModeToggle />
        <SignupForm />
      </div>
    </ThemeProvider>
  );
};

export default App;
