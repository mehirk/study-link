import { authClient } from "./lib/auth-client";

const App = () => {
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await authClient.signUp.email({
      email: "user@email.com",
      name: "Users",
      password: "password",
    });

    if (error) {
      console.error("Sign up error details:", error);
      throw error;
    }

    console.log("Sign up successful:", data);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await authClient.signIn.email({
      email: "user@email.com",
      password: "password",
    });

    if (error) {
      console.error("Sign in error details:", error);
      throw error;
    }

    console.log("Sign in successful:", data);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 gap-4">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <button
        className="bg-blue-500 text-white p-2 rounded-md cursor-pointer"
        onClick={handleSignUp}
      >
        Sign Up
      </button>
      <button
        className="bg-blue-500 text-white p-2 rounded-md cursor-pointer"
        onClick={handleSignIn}
      >
        Sign In
      </button>
    </div>
  );
};

export default App;
