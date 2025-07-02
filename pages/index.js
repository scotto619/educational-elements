import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-300 p-6">
      <h1 className="text-5xl font-bold mb-4 text-gray-800">Educational Elements</h1>
      <p className="text-lg text-gray-700 mb-8">Gamify. Simplify. Inspire.</p>

      <div className="space-x-4">
        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          onClick={() => router.push('/login')}
        >
          Login
        </button>
        <button
          className="bg-white text-blue-600 px-6 py-3 rounded-lg border border-blue-600 hover:bg-blue-50"
          onClick={() => router.push('/signup')}
        >
          Sign Up
        </button>
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          onClick={() => router.push('/classroom-champions')}
        >
          Try Classroom Champions
        </button>
      </div>
    </div>
  );
}
