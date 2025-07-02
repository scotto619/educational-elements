import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { auth } from '../utils/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard'); // redirect after login
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-200 to-blue-300 p-6">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">Login</h1>

      <form onSubmit={handleLogin} className="flex flex-col w-full max-w-sm space-y-4">
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
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>

      <p className="mt-4 text-gray-700">
        Don’t have an account?{' '}
        <Link href="/signup">
          <span className="text-blue-600 hover:underline">Sign up</span>
        </Link>
      </p>
    </div>
  );
}
