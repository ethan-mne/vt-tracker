import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }
    
    setLoading(true);

    try {
      const { error } = await signUp(email, password);
      if (error) {
        setError(error.message || 'Failed to create account. Please try again.');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
          <svg 
            className="w-8 h-8 text-green-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h3 className="text-xl font-semibold mb-2">Account Created!</h3>
        <p className="text-gray-600 mb-6">
          You can now sign in with your email and password.
        </p>
        <Link to="/sign-in">
          <Button className="w-full">Go to Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold text-center mb-6">Create an Account</h3>
      
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
          placeholder="Create a password"
          required
          autoComplete="new-password"
        />
        
        <Input
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          required
          autoComplete="new-password"
        />
        
        <Button
          type="submit"
          className="w-full mt-6 flex items-center justify-center gap-2"
          loading={loading}
        >
          <UserPlus className="h-5 w-5" />
          Create Account
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/sign-in" className="text-blue-600 hover:text-blue-800 font-medium">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default SignUpPage;