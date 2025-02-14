import React, { useState } from 'react';
import { authClient } from "./lib/auth-client";

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const { data, error: authError } = await authClient.signUp.email({
        email,
        name,
        password,
      });

      if (authError) {
        setError(authError.message);
        throw authError;
      }

      console.log('Sign up successful:', data);
      // Redirect to login or another page if needed
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Sign up failed');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 gap-4">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="p-2 border border-gray-300 rounded-md"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-md cursor-pointer"
        >
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default Signup;