import { useState } from "react";
import { Label } from "@components/ui/label";
import { Input } from "@components/ui/input";
import { cn } from "@lib/utils";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { ArrowRight } from "lucide-react";

export function SignInForm({
  onSubmit,
  isLoading = false,
}: {
  onSubmit: (credentials: { email: string; password: string }) => void;
  isLoading?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ email, password });
  };
  return (
    <Card className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-0 shadow-input">
      <CardHeader className="pb-0">
        <CardTitle>Welcome</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>

      <CardContent>
        <form className="my-4" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              placeholder="Enter your email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </LabelInputContainer>

          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? "Signing in..." : "Sign in"}{" "}
            {!isLoading && <ArrowRight />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

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
