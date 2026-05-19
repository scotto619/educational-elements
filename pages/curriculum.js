// pages/curriculum.js — Resource Hub (the main resource area)
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { auth } from '../utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const ResourceHubTab = lazy(() => import('../components/tabs/ResourceHubTab'));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
  </div>
);

export default function CurriculumPage() {
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setLoading(false);
      } else {
        router.push('/login');
      }
    });
    return () => unsub();
  }, [router]);

  const showToast = (message, type = 'info') => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Head>
        <title>Resource Hub — Educational Elements</title>
        <meta name="description" content="All your curriculum resources, displays, and worksheets in one place." />
      </Head>

      <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg,#fdf6ff 0%,#f0f9ff 50%,#fff7ed 100%)' }}>

        {/* ── Nav Bar ────────────────────────────────────────────────────────── */}
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/Logo.png" alt="Educational Elements" width={36} height={36} className="rounded-lg" />
            <span className="font-black text-slate-800 text-lg tracking-tight hidden sm:block">Educational Elements</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/main-menu')}
              className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50"
            >
              ← Main Menu
            </button>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-slate-500 hover:text-rose-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50"
            >
              Log out
            </button>
          </div>
        </nav>

        {/* ── Main Content ───────────────────────────────────────────────────── */}
        <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<LoadingSpinner />}>
            <ResourceHubTab showToast={showToast} />
          </Suspense>
        </main>

        {/* ── Toast ─────────────────────────────────────────────────────────── */}
        {toastMsg && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white transition-all animate-in slide-in-from-bottom-4 ${
              toastMsg.type === 'error'
                ? 'bg-rose-600'
                : toastMsg.type === 'success'
                ? 'bg-emerald-600'
                : 'bg-indigo-600'
            }`}
          >
            {toastMsg.message}
          </div>
        )}
      </div>
    </>
  );
}
