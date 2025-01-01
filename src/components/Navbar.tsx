import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from './ui/button';

const Navbar = () => {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setIsLoggedIn(!!user);
    };

    const handleHomeClick = () => {
        router.push(isLoggedIn ? '/dashboard' : '/');
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
    };

    return (
        <nav className="bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <button
                            onClick={handleHomeClick}
                            className="text-2xl font-bold text-blue-600 hover:text-blue-700"
                        >
                            Misty
                        </button>
                    </div>

                    <div className="flex items-center space-x-8">
                        <div className="hidden md:flex space-x-8">
                            <a
                                href="#"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                About
                            </a>
                            <a
                                href="#"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Pricing
                            </a>
                            <a
                                href="#"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                FAQ
                            </a>
                        </div>

                        {isLoggedIn ? (
                            <Button
                                onClick={handleLogout}
                                className="bg-gray-900 text-blue-600 hover:bg-gray-800"
                            >
                                Log Out
                            </Button>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Button
                                    onClick={() => router.push('/login')}
                                    className="bg-gray-900 text-blue-600 hover:bg-gray-800"
                                >
                                    Sign In
                                </Button>
                                <Button
                                    onClick={() => router.push('/signup')}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Sign Up
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
