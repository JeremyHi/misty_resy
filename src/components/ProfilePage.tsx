import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { ReservationHistoryItem, ReservationRequest } from '@/types/reservation';
import ResyCredentialsModal from '@/components/ResyCredentialsModal';
import ReservationDetailsModal from '@/components/ReservationDetailsModal';

interface ResyCredentials {
    email: string;
    last_used: string;
}

interface UserStats {
    total: number;
    successful: number;
}

const ProfilePage = () => {
    const [resyCredentials, setResyCredentials] = useState<ResyCredentials | null>(null);
    const [showResyModal, setShowResyModal] = useState(false);
    const [reservationStats, setReservationStats] = useState<UserStats>({ total: 0, successful: 0 });
    const [reservationHistory, setReservationHistory] = useState<ReservationHistoryItem[]>([]);
    const [selectedReservation, setSelectedReservation] = useState<ReservationHistoryItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleUnlinkResy = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from('resy_credentials')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;

            setResyCredentials(null);
            setDeleteSuccess(true);

            // Clear success message after 3 seconds
            setTimeout(() => {
                setDeleteSuccess(false);
            }, 3000);

        } catch (error) {
            console.error('Error unlinking Resy account:', error);
        }
    };

    const fetchUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Resy credentials
            const { data: resyData } = await supabase
                .from('resy_credentials')
                .select('email, updated_at')
                .eq('user_id', user.id)
                .single();

            if (resyData) {
                setResyCredentials({
                    email: resyData.email.replace(/(.{3}).*(@.*)/, '$1***$2'),
                    last_used: new Date(resyData.updated_at).toLocaleDateString()
                });
            }

            // Fetch reservation stats
            const { data: reservations } = await supabase
                .from('reservation_requests')
                .select('id, status')
                .eq('user_id', user.id);

            if (reservations) {
                setReservationStats({
                    total: reservations.length,
                    successful: reservations.filter(r => r.status === 'successful').length
                });
            }

            // Fetch reservation history
            const { data: history } = await supabase
                .from('reservation_requests')
                .select(`
                    id,
                    created_at,
                    status,
                    party_size,
                    desired_date,
                    desired_times,
                    booking_reference,
                    restaurants (
                        id,
                        name,
                        thumbnail_url
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10)
                .returns<ReservationRequest[]>();

            if (history) {
                const typedHistory: ReservationHistoryItem[] = history.map(item => ({
                    id: item.id,
                    created_at: item.created_at,
                    status: item.status as 'active' | 'successful' | 'expired',
                    party_size: item.party_size,
                    desired_date: item.desired_date,
                    desired_times: item.desired_times,
                    booking_reference: item.booking_reference,
                    restaurant: {
                        id: item.restaurants.id,
                        name: item.restaurants.name,
                        thumbnail_url: item.restaurants.thumbnail_url
                    }
                }));

                setReservationHistory(typedHistory);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <p className="text-xl text-gray-600">Loading...</p>
                </div>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="space-y-8">
                    {/* Resy Credentials Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Resy Account</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {resyCredentials ? (
                                <div>
                                    <p className="text-gray-600">Connected Account: {resyCredentials.email}</p>
                                    <p className="text-gray-500 text-sm">Last used: {resyCredentials.last_used}</p>
                                    <div className="mt-4">
                                        <Button
                                            onClick={handleUnlinkResy}
                                            className="bg-red-600 text-white hover:bg-red-700 destructive"
                                        >
                                            Unlink Resy Account
                                        </Button>
                                    </div>
                                    {deleteSuccess && (
                                        <p className="mt-2 text-green-600">Resy account successfully unlinked!</p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <p className="text-gray-600 mb-4">No Resy account connected</p>
                                    <Button onClick={() => setShowResyModal(true)}>
                                        Connect Resy Account
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Billing Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing & Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">No payment method added</p>
                            <Button>Add Payment Method</Button>
                        </CardContent>
                    </Card>

                    {/* Stats Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-2xl font-bold text-gray-600">{reservationStats.total}</p>
                                    <p className="text-gray-600">Total Reservations</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-600">{reservationStats.successful}</p>
                                    <p className="text-gray-600">Successful Bookings</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* History Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Reservation History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 text-gray-600">Restaurant</th>
                                            <th className="text-left py-3 text-gray-600">Date Requested</th>
                                            <th className="text-left py-3 text-gray-600">Status</th>
                                            <th className="text-left py-3 text-gray-600">Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reservationHistory.map((reservation) => (
                                            <tr
                                                key={reservation.id}
                                                onClick={() => setSelectedReservation(reservation)}
                                                className="border-b hover:bg-gray-50 cursor-pointer"
                                            >
                                                <td className="py-3 text-gray-600">{reservation.restaurant.name}</td>
                                                <td className="py-3 text-gray-600">
                                                    {new Date(reservation.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 text-gray-600">
                                                    <span className={`px-2 py-1 rounded-full text-sm ${reservation.status === 'successful' ? 'bg-green-100 text-green-800' :
                                                        reservation.status === 'expired' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {reservation.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-gray-600">
                                                    {reservation.booking_reference || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            {showResyModal && (
                <ResyCredentialsModal
                    onClose={() => setShowResyModal(false)}
                    onSuccess={() => {
                        setShowResyModal(false);
                        fetchUserData();
                    }}
                />
            )}

            {selectedReservation && (
                <ReservationDetailsModal
                    reservation={selectedReservation}
                    onClose={() => setSelectedReservation(null)}
                />
            )}
        </div>
    );
};

export default ProfilePage;
