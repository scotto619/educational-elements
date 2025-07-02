import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { auth } from '../utils/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

const handleSignup = async (e) => {
  e.preventDefault();

  if (!email || !password || !confirmPassword) {
    alert("Please fill in all fields");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    router.push('/dashboard');
  } catch (error) {
    alert(error.message);
  }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-200 to-pink-300 p-6">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">Sign Up</h1>

      <form onSubmit={handleSignup} className="flex flex-col w-full max-w-sm space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="px-4 py-2 rounded border border-gray-400 bg-white text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="px-4 py-2 rounded border border-gray-400 bg-white text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="px-4 py-2 rounded border border-gray-400 bg-white text-black"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Sign Up
        </button>
      </form>

      <p className="mt-4 text-gray-700">
        Already have an account?{' '}
        <Link href="/login">
          <span className="text-purple-600 hover:underline">Login</span>
        </Link>
      </p>
    </div>
  );
}
