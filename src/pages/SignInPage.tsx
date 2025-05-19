"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/useAuth';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error("Sign in error:", error);
        setError('Invalid email or password. Please try again.');
      } else {
        // Successful login - redirect to home
        router.push('/');
      }
    } catch (err) {
      console.error("Unexpected error during sign in:", err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-center mb-6">Sign In</h3>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        
        <Input
          label="Password"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
          autoComplete="current-password"
        />
        
        <Button
          type="submit"
          className="w-full mt-6 flex items-center justify-center gap-2"
          loading={loading}
        >
          <LogIn className="h-5 w-5" />
          Sign In
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{' '}
        <Link href="/sign-up" className="text-blue-600 hover:text-blue-800 font-medium">
          Sign up
        </Link>
      </div>
    </div>
  );
};

export default SignInPage;