"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { SignInForm } from "./sign-in";
import { SignupForm } from "./sign-up";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@lib/auth-client";

export function AuthTabs() {
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSignIn = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await authClient.signIn.email({
        ...credentials,
      });

      if (error) {
        setError(error.message || "Sign in failed");
        return;
      }

      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred during sign in";
      setError(errorMessage);
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (credentials: {
    email: string;
    password: string;
    name: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await authClient.signUp.email({
        ...credentials,
      });

      if (error) {
        setError(error.message || "Sign up failed");
        return;
      }

      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred during sign up";
      setError(errorMessage);
      console.error("Sign up error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs defaultValue="signin" className="w-full max-w-md">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="signin">Sign In</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <TabsContent value="signin">
        <SignInForm onSubmit={handleSignIn} isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="signup">
        <SignupForm onSubmit={handleSignUp} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
}
