"use client";
import React, { useState } from "react";
import { Label } from "@components/ui/label";
import { Input } from "@components/ui/input";
import { cn } from "@lib/utils";
import { authClient } from "@lib/auth-client";
import { useAuth } from "../contexts/AuthContext";

export function SignupForm({
  isLoading = false
}: {
  isLoading?: boolean;
}) {
  const { checkAuthStatus } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setError(null);
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLocalLoading(true);
      const { data, error: authError } = await authClient.signUp.email({
        email,
        name,
        password,
      });

      if (authError) {
        const errorMessage = typeof authError.message === 'string'
          ? authError.message
          : "Sign up failed";
        setError(errorMessage);
        return;
      }

      console.log('Sign up successful:', data);
      
      // Automatically sign in after signup
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
      });
      
      if (signInError) {
        const errorMessage = typeof signInError.message === 'string'
          ? signInError.message
          : "Sign in after signup failed";
        setError(errorMessage);
        return;
      }
      
      // Trigger auth check to redirect to dashboard
      await checkAuthStatus();
    } catch (err: any) {
      const errorMessage = typeof err.message === 'string'
        ? err.message
        : "An error occurred during sign up";
      setError(errorMessage);
      console.error('Sign up error:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const actualLoading = isLoading || localLoading;

  return (
    <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black">
      <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
        Welcome to Study Link
      </h2>

      <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
        Create an account to get started and start your journey to success
      </p>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form className="my-8" onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
          <LabelInputContainer>
            <Label htmlFor="firstname">First name</Label>
            <Input
              id="firstname"
              placeholder="Tyler"
              type="text"
              onChange={(e) => setName(e.target.value)}
              disabled={actualLoading}
            />
          </LabelInputContainer>
        </div>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            placeholder="projectmayhem@fc.com"
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            disabled={actualLoading}
          />
        </LabelInputContainer>

        <LabelInputContainer className="mb-4">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="••••••••"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            disabled={actualLoading}
          />
        </LabelInputContainer>

        <LabelInputContainer className="mb-8">
          <Label htmlFor="confirmpassword">Please confirm your password</Label>
          <Input
            id="confirmPassword"
            placeholder="••••••••"
            type="password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={actualLoading}
          />
        </LabelInputContainer>

        <button
          className={cn(
            "bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]",
            actualLoading && "opacity-70 cursor-not-allowed"
          )}
          type="submit"
          disabled={actualLoading}
        >
          {actualLoading ? "Signing up..." : "Sign up"} {!actualLoading && "→"}
          <BottomGradient />
        </button>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
