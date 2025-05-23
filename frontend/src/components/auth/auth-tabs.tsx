"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs";
import { SignInForm } from "./sign-in";
import { useState } from "react";
import { authClient } from "@lib/api-client";
import { Card } from "@components/ui/card";
import { SignupForm } from "./sign-up";
import { useToast } from "@components/ui/use-toast";
import useAuthStore from "@store/auth-store";

export function AuthTabs() {
  const setUser = useAuthStore((state) => state.setUser);
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
  const refreshSession = useAuthStore((state) => state.refreshSession);

  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async (credentials: {
    email: string;
    password: string;
  }) => {
    try {
      setIsLoading(true);

      const { data, error } = await authClient.signIn.email({
        ...credentials,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description:
            error.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setUser(data.user);
      setIsAuthenticated(true);
      await refreshSession();

      toast({
        title: "Success",
        description: "You have been signed in successfully!",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred during sign in";
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
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

      const { data, error } = await authClient.signUp.email({
        ...credentials,
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description:
            error.message || "Unable to create account. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setUser(data.user);
      setIsAuthenticated(true);
      await refreshSession();

      toast({
        title: "Account created",
        description: "Your account has been created successfully!",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred during sign up";
      toast({
        title: "Sign up failed",
        description: errorMessage,
        variant: "destructive",
      });
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
      <Card className="my-2">
        <TabsContent value="signin">
          <SignInForm onSubmit={handleSignIn} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="signup">
          <SignupForm onSubmit={handleSignUp} isLoading={isLoading} />
        </TabsContent>
      </Card>
    </Tabs>
  );
}
