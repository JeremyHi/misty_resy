import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Toast from '@/components/Toast';
import { Restaurant } from '@/types/reservation';

const NewRequestPage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [formData, setFormData] = useState({
        restaurantId: '',
        partySize: 2,
        desiredDate: '',
        desiredTimes: ['19:00', '19:30', '20:00'],
    });
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

    // Fetch restaurants when component mounts
    React.useEffect(() => {
        const fetchRestaurants = async () => {
            const { data, error } = await supabase
                .from('restaurants')
                .select('*')
                .returns<Restaurant[]>();

            if (error) {
                setToast({
                    message: 'Error loading restaurants',
                    type: 'error'
                });
                return;
            }

            setRestaurants(data || []);
        };

        fetchRestaurants();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { error } = await supabase
                .from('reservation_requests')
                .insert({
                    user_id: user.id,
                    restaurant_id: formData.restaurantId,
                    party_size: formData.partySize,
                    desired_date: formData.desiredDate,
                    desired_times: formData.desiredTimes,
                    status: 'active'
                });

            if (error) throw error;

            setToast({
                message: 'Reservation request created successfully!',
                type: 'success'
            });

            // Navigate back to dashboard after a short delay
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);

        } catch (error) {
            setToast({
                message: 'Error creating reservation request',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-600">
            <Navbar />
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 mt-16">
                <Card>
                    <CardHeader>
                        <CardTitle>Create New Reservation Request</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Restaurant
                                </label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={formData.restaurantId}
                                    onChange={(e) => setFormData(prev => ({ ...prev, restaurantId: e.target.value }))}
                                    required
                                >
                                    <option value="">Select a restaurant</option>
                                    {restaurants.map((restaurant) => (
                                        <option key={restaurant.id} value={restaurant.id}>
                                            {restaurant.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Party Size
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={formData.partySize}
                                    onChange={(e) => setFormData(prev => ({ ...prev, partySize: parseInt(e.target.value) }))}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Desired Date
                                </label>
                                <input
                                    type="date"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={formData.desiredDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, desiredDate: e.target.value }))}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Preferred Times
                                </label>
                                <div className="mt-1 space-y-2">
                                    {formData.desiredTimes.map((time, index) => (
                                        <input
                                            key={index}
                                            type="time"
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            value={time}
                                            onChange={(e) => {
                                                const newTimes = [...formData.desiredTimes];
                                                newTimes[index] = e.target.value;
                                                setFormData(prev => ({ ...prev, desiredTimes: newTimes }));
                                            }}
                                            required
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Button
                                    type="button"
                                    onClick={() => router.push('/dashboard')}
                                    className="bg-red-600 text-gray-700 hover:bg-red-700"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    {loading ? 'Creating...' : 'Create Request'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default NewRequestPage;
