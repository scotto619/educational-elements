import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { auth, firestore } from '../utils/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function MainMenu() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeClass, setActiveClass] = useState(null);

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
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-purple-100 placeholder-opacity-100">
            <Head>
                <title>Main Menu | Educational Elements</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            {/* Navigation Bar */}
            <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center cursor-pointer" onClick={() => router.push('/dashboard')}>
                            <div className="flex-shrink-0 flex items-center">
                                <Image
                                    src="/Logo/LOGO_NoBG.png"
                                    alt="Logo"
                                    width={40}
                                    height={40}
                                    className="h-10 w-10 sm:h-12 sm:w-12 transition-transform hover:scale-105"
                                />
                                <span className="ml-3 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 hidden sm:block">
                                    Educational Elements
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="text-gray-600 hover:text-purple-600 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-50"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-all shadow-md transform hover:-translate-y-0.5 text-sm font-semibold"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                {/* Header Section with Main Logo Banner */}
                <div className="relative mb-12 sm:mb-16 transform transition-all hover:scale-[1.01] duration-500">
                    <div className="rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-900/5">
                        <Image
                            src="/Displays/Banners/Educational Elements.png"
                            alt="Educational Elements"
                            width={1200}
                            height={400}
                            className="w-full h-auto object-cover"
                            priority
                        />
                        {/* Optional Overlay Content if the banner is too plain, but the user requested REPLACEMENT of headings with banner */}
                    </div>
                </div>

                {/* Primary Options - The Big Three */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">

                    {/* Classroom Champions */}
                    <div
                        onClick={() => handleNavigation('/classroom-champions')}
                        className="group cursor-pointer relative"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl opacity-50 blur group-hover:opacity-100 transition duration-300"></div>
                        <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl transform transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl h-full">
                            <div className="relative h-48 sm:h-64 overflow-hidden">
                                <Image
                                    src="/Displays/Banners/ClassroomChampions.png"
                                    alt="Classroom Champions"
                                    fill
                                    className="object-contain transform group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="p-6 text-center">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">Classroom Champions</h2>
                                <p className="text-gray-600">Enter the gamified classroom experience.</p>
                            </div>
                        </div>
                    </div>

                    {/* Curriculum Corner */}
                    <div
                        onClick={() => handleNavigation('/classroom-champions?tab=curriculum')}
                        className="group cursor-pointer relative"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl opacity-50 blur group-hover:opacity-100 transition duration-300"></div>
                        <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl transform transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl h-full">
                            <div className="relative h-48 sm:h-64 overflow-hidden">
                                <Image
                                    src="/Displays/Banners/CurriculumCorner.png"
                                    alt="Curriculum Corner"
                                    fill
                                    className="object-contain transform group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="p-6 text-center">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Curriculum Corner</h2>
                                <p className="text-gray-600">Access resources, displays, and lesson plans.</p>
                            </div>
                        </div>
                    </div>

                    {/* Teacher Toolkit */}
                    <div
                        onClick={() => handleNavigation('/classroom-champions?tab=toolkit')}
                        className="group cursor-pointer relative"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl opacity-50 blur group-hover:opacity-100 transition duration-300"></div>
                        <div className="relative bg-white rounded-2xl overflow-hidden shadow-xl transform transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl h-full">
                            <div className="relative h-48 sm:h-64 overflow-hidden">
                                <Image
                                    src="/Displays/Banners/TeacherToolkit.png"
                                    alt="Teacher Toolkit"
                                    fill
                                    className="object-contain transform group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>
                            <div className="p-6 text-center">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Teacher Toolkit</h2>
                                <p className="text-gray-600">Manage students, groups, and daily tasks.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Navigation - Other Banners */}
                <div className="relative">
                    <div className="flex items-center justify-center mb-8">
                        <div className="h-px w-24 bg-gray-300"></div>
                        <span className="px-4 text-gray-400 text-sm font-semibold uppercase tracking-widest">More Adventures</span>
                        <div className="h-px w-24 bg-gray-300"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">

                        {/* Shop */}
                        <div
                            onClick={() => handleNavigation('/classroom-champions?tab=shop')}
                            className="cursor-pointer group rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
                        >
                            <div className="relative h-32 sm:h-40">
                                <Image
                                    src="/Displays/Banners/Shop.png"
                                    alt="Shop"
                                    fill
                                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                        </div>

                        {/* Quests */}
                        <div
                            onClick={() => handleNavigation('/classroom-champions?tab=quests')}
                            className="cursor-pointer group rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
                        >
                            <div className="relative h-32 sm:h-40">
                                <Image
                                    src="/Displays/Banners/Quests.png"
                                    alt="Quests"
                                    fill
                                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                        </div>

                        {/* Games */}
                        <div
                            onClick={() => handleNavigation('/classroom-champions?tab=games')}
                            className="cursor-pointer group rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
                        >
                            <div className="relative h-32 sm:h-40">
                                <Image
                                    src="/Displays/Banners/Games.png"
                                    alt="Games"
                                    fill
                                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                        </div>

                        {/* Students */}
                        <div
                            onClick={() => handleNavigation('/classroom-champions?tab=students')}
                            className="cursor-pointer group rounded-xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.03]"
                        >
                            <div className="relative h-32 sm:h-40">
                                <Image
                                    src="/Displays/Banners/Students.png"
                                    alt="Students"
                                    fill
                                    className="object-contain transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                            </div>
                        </div>

                    </div>
                </div>

            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-12 py-8">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Educational Elements. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
