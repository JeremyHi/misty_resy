import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface ResyCredentialsModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const ResyCredentialsModal: React.FC<ResyCredentialsModalProps> = ({ onClose, onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/resy/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Invalid Resy credentials');
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { error: dbError } = await supabase
                .from('resy_credentials')
                .upsert({
                    user_id: user.id,
                    email,
                    encrypted_password: password // Note: Use proper encryption in production
                });

            if (dbError) throw dbError;
            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-bold mb-4 text-gray-700">Connect Resy Account</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block font-bold text-sm text-gray-700">Resy Email</label>
                            <input
                                type="email"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 text-gray-700 shadow-md focus:border-blue-500 focus:ring-blue-500"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700">Resy Password</label>
                            <input
                                type="password"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 text-gray-700 shadow-md focus:border-blue-500 focus:ring-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && (
                            <div className="text-red-600 text-sm">
                                {error}
                            </div>
                        )}
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                onClick={onClose}
                                className="bg-red-600 text-white hover:bg-red-700 destructive"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Connecting...' : 'Connect Account'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResyCredentialsModal;
