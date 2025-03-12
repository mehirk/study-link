// import { authClient } from "./lib/auth-client";
import { ModeToggle } from "@components/mode-toggle";
import { ThemeProvider } from "@components/theme-provider";
import { AuthTabs } from "@components/auth-tabs";

const App = () => {
  return (
    <ThemeProvider>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="absolute top-4 right-4">
          <ModeToggle />
        </div>
        <AuthTabs />
      </div>
    </ThemeProvider>
  );
};

export default App;
