"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { SignInForm } from "./sign-in"
import { SignupForm } from "./sign-up"
import { authClient } from "@lib/auth-client"
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

export function AuthTabs() {
  const { checkAuthStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error: signInError } = await authClient.signIn.email({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (signInError) {
        const errorMessage = typeof signInError.message === 'string' 
          ? signInError.message 
          : "Sign in failed";
        setError(errorMessage);
        return;
      }
      
      await checkAuthStatus();
    } catch (err: any) {
      const errorMessage = typeof err.message === 'string'
        ? err.message
        : 'An error occurred during sign in';
      setError(errorMessage);
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin" disabled={isLoading}>Sign In</TabsTrigger>
          <TabsTrigger value="signup" disabled={isLoading}>Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <SignInForm onSubmit={handleSignIn} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="signup">
          <SignupForm isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
} 