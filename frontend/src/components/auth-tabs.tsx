"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { SignInForm } from "./sign-in";
import { SignupForm } from "./sign-up";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function AuthTabs() {
  const { login, signup } = useAuth();
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

      const { success, error } = await login(
        credentials.email,
        credentials.password,
      );

      if (!success) {
        setError(error || "Sign in failed");
        return;
      }

      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage =
        typeof err.message === "string"
          ? err.message
          : "An error occurred during sign in";
      setError(errorMessage);
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: {
    email: string;
    password: string;
    name: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const { success, error } = await signup(
        data.email,
        data.password,
        data.name,
      );

      if (!success) {
        setError(error || "Sign up failed");
        return;
      }

      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage =
        typeof err.message === "string"
          ? err.message
          : "An error occurred during sign up";
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
