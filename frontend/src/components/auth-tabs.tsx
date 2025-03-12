"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@components/ui/tabs"
import { SignInForm } from "./sign-in"
import { SignupForm } from "./sign-up"
import { authClient } from "@lib/auth-client"
export function AuthTabs() {
  const handleSignIn = async (credentials: { email: string; password: string }) => {
    // Handle sign in logic here
    await authClient.signIn.email({
      email: credentials.email,
      password: credentials.password,
    });
    console.log('Sign in:', credentials);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Tabs defaultValue="signin" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <SignInForm onSubmit={handleSignIn} />
        </TabsContent>
        <TabsContent value="signup">
          <SignupForm />
        </TabsContent>
      </Tabs>
    </div>
  )
} 