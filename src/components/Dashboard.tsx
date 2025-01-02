import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { ReservationRequest, Restaurant } from '@/types/reservation';

const formatTime = (time: string): string => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
};

const ReservationTile = ({ request, restaurant }: { request: ReservationRequest; restaurant: Restaurant }) => {
    return (
        <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="space-y-1">
                <div className="w-full h-48 relative">
                    <img
                        src={restaurant.thumbnail_url || '/api/placeholder/400/320'}
                        alt={restaurant.name}
                        className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
                    />
                </div>
                <CardTitle className="text-xl font-bold">{restaurant.name}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                        Party of {request.party_size}
                    </p>
                    <p className="text-sm text-gray-600">
                        Date: {new Date(request.desired_date).toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {request.desired_times.map((time) => (
                            <span
                                key={time}
                                className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                            >
                                {formatTime(time)}
                            </span>
                        ))}
                    </div>
                    {request.booking_reference && (
                        <div className="mt-4 p-2 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-600 font-medium">
                                Booking confirmed: #{request.booking_reference}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const Dashboard = () => {
    const [activeRequests, setActiveRequests] = useState<ReservationRequest[]>([]);
    const [pastRequests, setPastRequests] = useState<ReservationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                // Fetch active requests
                const { data: activeData } = await supabase
                    .from('reservation_requests')
                    .select(`
                        *,
                        restaurants (*)
                    `)
                    .eq('user_id', user!.id)
                    .eq('status', 'active')
                    .order('created_at', { ascending: false })
                    .returns<ReservationRequest[]>();

                // Fetch past requests
                const { data: pastData } = await supabase
                    .from('reservation_requests')
                    .select(`
                        *,
                        restaurants (*)
                    `)
                    .eq('user_id', user!.id)
                    .in('status', ['successful', 'expired'])
                    .order('created_at', { ascending: false })
                    .returns<ReservationRequest[]>();;

                setActiveRequests(activeData || []);
                setPastRequests(pastData || []);
            } catch (error) {
                console.error('Error fetching reservations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, []);

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-xl text-gray-600">Loading...</div>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto space-y-12">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Current Reservation Requests
                        </h2>
                        {activeRequests.length === 0 ? (
                            <p className="text-gray-600">No active reservation requests</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeRequests.map((request) => (
                                    <ReservationTile
                                        key={request.id}
                                        request={request}
                                        restaurant={request.restaurants}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Past Reservations
                        </h2>
                        {pastRequests.length === 0 ? (
                            <p className="text-gray-600">No past reservations</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pastRequests.map((request) => (
                                    <ReservationTile
                                        key={request.id}
                                        request={request}
                                        restaurant={request.restaurants}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
