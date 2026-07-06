import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import TutorialGuide from '../components/TutorialGuide';

export default function MainMenu() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeClass, setActiveClass] = useState(null);
    const [showTutorial, setShowTutorial] = useState(false);
    const [isFirstVisit, setIsFirstVisit] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const docRef = doc(firestore, 'users', currentUser.uid);
                    const snap = await getDoc(docRef);
                    if (snap.exists()) {
                        const data = snap.data();
                        setUserData(data);
                        // Auto-open the tutorial guide on the user's very first login
                        if (!data.hasSeenTutorial) {
                            setIsFirstVisit(true);
                            setShowTutorial(true);
                        }

                        // Try to find the active class name
                        if (data.activeClassId) {
                            // Check V2 classes logic or fallback to V1 local array
                            // Simulating basic check here for display purposes
                            if (data.classes && Array.isArray(data.classes)) {
                                const cls = data.classes.find(c => c.id === data.activeClassId);
                                if (cls) setActiveClass(cls);
                            }
                            // If V2, we might strictly need to fetch from 'classes' collection, 
                            // but for the menu header, even just "Your Class" is fine if missing.
                            // For now, let's just proceed.
                        }
                    }
                } catch (err) {
                    console.error("Error loading user data for menu:", err);
                }
                setLoading(false);
            } else {
                router.push('/login');
            }
        });

        return () => unsubscribe();
    }, [router]);

    const handleNavigation = (path) => {
        router.push(path);
    };

    const handleCloseTutorial = async () => {
        setShowTutorial(false);
        // Persist the flag so the guide only auto-opens once per account
        if (isFirstVisit && user) {
            setIsFirstVisit(false);
            try {
                await updateDoc(doc(firestore, 'users', user.uid), { hasSeenTutorial: true });
            } catch (err) {
                console.error('Error saving tutorial flag:', err);
            }
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-sans" style={{ background: 'linear-gradient(135deg, #fdf6ff 0%, #f0f9ff 50%, #fff7ed 100%)' }}>

            {/* ── Tutorial / Website Guide ── */}
            {showTutorial && <TutorialGuide onClose={handleCloseTutorial} />}
            <Head>
                <title>Main Menu | Educational Elements</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            {/* Navigation Bar */}
            <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-purple-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center cursor-pointer" onClick={() => router.push('/main-menu')}>
                            <div className="flex-shrink-0 flex items-center">
                                <Image
                                    src="/Logo/LOGO_NoBG.png"
                                    alt="Logo"
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 sm:h-12 sm:w-12 transition-transform hover:scale-105"
                                />
                                <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500 hidden sm:block">
                                    Educational Elements
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            {userData?.email && (
                                <span className="text-sm text-gray-500 hidden sm:block">
                                    👋 {userData.email.split('@')[0]}
                                </span>
                            )}
                            <button
                                onClick={() => setShowTutorial(true)}
                                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all shadow-md text-sm font-semibold flex items-center gap-1.5"
                            >
                                📖 <span className="hidden sm:inline">Website</span> Guide
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-all shadow-md text-sm font-semibold"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                {/* Header Section with Main Logo Banner */}
                <div className="relative mb-10 sm:mb-14 transform transition-all hover:scale-[1.01] duration-500">
                    <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-purple-100">
                        <Image
                            src="/Displays/Banners/Educational Elements.png"
                            alt="Educational Elements"
                            width={1200}
                            height={400}
                            className="w-full h-auto object-cover"
                            priority
                        />
                    </div>
                </div>

                {/* Section label */}
                <div className="text-center mb-8">
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest">Choose your area</p>
                </div>

                {/* Primary Options - The Big Three */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7 mb-8">

                    {/* Classroom Champions — needs a class → go to dashboard */}
                    <div
                        onClick={() => handleNavigation('/dashboard')}
                        className="group cursor-pointer"
                    >
                        <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-amber-100 hover:border-amber-300 transform transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl h-full">
                            {/* Pastel colour band at top */}
                            <div className="h-3 w-full bg-gradient-to-r from-amber-300 to-orange-300 rounded-t-3xl" />
                            <div className="relative h-44 sm:h-52 overflow-hidden bg-amber-50">
                                <Image
                                    src="/Displays/Banners/ClassroomChampions.png"
                                    alt="Classroom Champions"
                                    fill
                                    className="object-contain p-4 transform group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-5 text-center border-t border-amber-100">
                                <h2 className="text-2xl font-black text-gray-800 mb-1 group-hover:text-amber-600 transition-colors tracking-tight">Classroom Champions</h2>
                                <p className="text-gray-500 text-sm">Gamified XP, quests, shop & more</p>
                                <div className="mt-4 inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full">
                                    Select a class to enter →
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resource Hub — no class needed → go straight to /curriculum */}
                    <div
                        onClick={() => handleNavigation('/curriculum')}
                        className="group cursor-pointer"
                    >
                        <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-blue-100 hover:border-blue-300 transform transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl h-full">
                            <div className="h-3 w-full bg-gradient-to-r from-sky-300 to-indigo-300 rounded-t-3xl" />
                            <div className="relative h-44 sm:h-52 overflow-hidden bg-blue-50">
                                <Image
                                    src="/Displays/Banners/CurriculumCorner.png"
                                    alt="Resource Hub"
                                    fill
                                    className="object-contain p-4 transform group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-5 text-center border-t border-blue-100">
                                <h2 className="text-2xl font-black text-gray-800 mb-1 group-hover:text-blue-600 transition-colors tracking-tight">Resource Hub</h2>
                                <p className="text-gray-500 text-sm">Lessons, worksheets, tools & displays</p>
                                <div className="mt-4 inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full">
                                    Browse resources →
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Teacher Toolkit — goes straight to toolkit */}
                    <div
                        onClick={() => handleNavigation('/teacher-tools')}
                        className="group cursor-pointer"
                    >
                        <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-emerald-100 hover:border-emerald-300 transform transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl h-full">
                            <div className="h-3 w-full bg-gradient-to-r from-emerald-300 to-teal-300 rounded-t-3xl" />
                            <div className="relative h-44 sm:h-52 overflow-hidden bg-emerald-50">
                                <Image
                                    src="/Displays/Banners/TeacherToolkit.png"
                                    alt="Teacher Toolkit"
                                    fill
                                    className="object-contain p-4 transform group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-5 text-center border-t border-emerald-100">
                                <h2 className="text-2xl font-black text-gray-800 mb-1 group-hover:text-emerald-600 transition-colors tracking-tight">Teacher Toolkit</h2>
                                <p className="text-gray-500 text-sm">Name picker, timer, timetable & more</p>
                                <div className="mt-4 inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full">
                                    Select a class to enter →
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick-links row - within Classroom Champions */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-purple-100 p-5 shadow-sm">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">Quick access — via Classroom Champions</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Shop', icon: '🛒', tab: 'shop', bg: 'from-amber-50 to-yellow-50', border: 'border-amber-200', text: 'text-amber-700' },
                            { label: 'Quests', icon: '📜', tab: 'quests', bg: 'from-purple-50 to-indigo-50', border: 'border-purple-200', text: 'text-purple-700' },
                            { label: 'Games', icon: '🎮', tab: 'games', bg: 'from-blue-50 to-cyan-50', border: 'border-blue-200', text: 'text-blue-700' },
                            { label: 'Students', icon: '👥', tab: 'students', bg: 'from-green-50 to-emerald-50', border: 'border-green-200', text: 'text-green-700' },
                        ].map(item => (
                            <button
                                key={item.tab}
                                onClick={() => handleNavigation(`/dashboard`)}
                                className={`flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl bg-gradient-to-br ${item.bg} border ${item.border} hover:shadow-md transition-all duration-200 hover:scale-[1.04] group`}
                            >
                                <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                <span className={`text-sm font-bold ${item.text}`}>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="border-t border-purple-100 mt-12 py-8 bg-white/50">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} Educational Elements. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
