// components/ResyCredentialsForm.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'
import { encrypt } from '@/utils/encryption';
import { supabase } from '@/lib/supabase';

export const ResyCredentialsForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter()

    const validateResyCredentials = async (email: string, password: string) => {
        try {
            const response = await fetch('/api/resy/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            return response.status === 200;
        } catch (error) {
            console.log(error);
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate Resy credentials
            const isValid = await validateResyCredentials(email, password);
            if (!isValid) {
                throw new Error('Invalid Resy credentials');
            }

            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            // Encrypt credentials before storing
            const encryptedPassword = await encrypt(password);

            // Store encrypted credentials in Supabase
            const { error: dbError } = await supabase
                .from('resy_credentials')
                .upsert({
                    user_id: user.id,
                    email,
                    encrypted_password: encryptedPassword
                });

            if (dbError) throw dbError;

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Connect your Resy account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        We'll securely store your credentials to make reservations on your behalf
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Resy Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="Resy Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {loading ? 'Connecting...' : 'Connect Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
