import { authClient } from "../lib/auth-client"; // Make sure this path is correct
import "./App.css";

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
    <div className="auth-container">
      <h1>Sign Up</h1>
      <button onClick={handleSignUp}>Sign Up</button>
      <button onClick={handleSignIn}>Sign In</button>
    </div>
  );
};

export default App;
