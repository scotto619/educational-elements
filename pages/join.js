// pages/join.js - REDIRECTS TO STUDENT PORTAL
// The standalone Quiz Show join page has been removed. Students now join
// Quiz Show games from inside the authenticated student portal, which uses
// the Realtime Database under the student's own session and sidesteps the
// permission-denied error unauthenticated joins were hitting.
//
// This page is kept only as a redirect so any old links, bookmarks, or
// printed instructions pointing to /join still take students somewhere
// useful instead of returning a 404.
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function JoinRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/student');
    }, 4000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <>
      <Head>
        <title>Quiz Show — Use the Student Portal | Educational Elements</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg text-center">
          <div className="text-6xl mb-4">🎪</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Quiz Show has moved!</h1>
          <p className="text-gray-700 mb-6 leading-relaxed">
            You now join Quiz Show games from inside your student portal. Log
            in with your class code, open the <strong>Quiz Show</strong> tab,
            and enter the room code your teacher gave you.
          </p>

          <Link
            href="/student"
            className="inline-block w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition shadow-lg"
          >
            Go to Student Portal →
          </Link>

          <p className="text-gray-500 text-sm mt-6">
            Redirecting you automatically in a few seconds…
          </p>
        </div>
      </div>
    </>
  );
}
