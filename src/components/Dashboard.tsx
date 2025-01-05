import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import { ReservationRequest, Restaurant } from '@/types/reservation';
import { Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }: { isOpen: boolean; onClose: () => void; onConfirm: () => void }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h2 className="text-xl font-bold mb-4">Delete Reservation Request</h2>
                <p className="mb-6">Are you sure you want to delete this reservation request?</p>
                <div className="flex justify-end space-x-4">
                    <Button
                        onClick={onClose}
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="bg-red-600 text-white hover:bg-red-700"
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
};

const formatTime = (time: string): string => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
};

const ReservationTile = ({ request, restaurant, onDelete }: { request: ReservationRequest; restaurant: Restaurant; onDelete?: () => void }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (onDelete) {
            onDelete();
        }
        setShowDeleteModal(false);
    };

    return (
        <>
            <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-200 relative">
                {onDelete && (
                    <button
                        onClick={handleDeleteClick}
                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 z-10"
                    >
                        <X className="h-5 w-5 text-gray-500 hover:text-red-600" />
                    </button>
                )}
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
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};

const CreateRequestTile = () => {
    const router = useRouter();

    return (
        <Card
            className="w-full max-w-sm hover:shadow-lg transition-shadow duration-200 cursor-pointer bg-gray-50 hover:bg-gray-100"
            onClick={() => router.push('/new-request')}
        >
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <Plus className="w-12 h-12 text-blue-600 mb-4" />
                <p className="text-lg font-semibold text-blue-600">Create a New Request</p>
            </div>
        </Card>
    );
};

const Dashboard = () => {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [activeRequests, setActiveRequests] = useState<ReservationRequest[]>([]);
    const [pastRequests, setPastRequests] = useState<ReservationRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const handleDeleteRequest = async (requestId: string) => {
        try {
            const { error } = await supabase
                .from('reservation_requests')
                .delete()
                .eq('id', requestId);

            if (error) throw error;

            // Update the state to remove the deleted request
            setActiveRequests(prev => prev.filter(request => request.id !== requestId));
        } catch (error) {
            console.error('Error deleting reservation:', error);
            // You might want to show an error toast/notification here
        }
    };

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
                    .returns<ReservationRequest[]>();

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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeRequests.map((request) => (
                                <ReservationTile
                                    key={request.id}
                                    request={request}
                                    restaurant={request.restaurants}
                                    onDelete={() => handleDeleteRequest(request.id)}
                                />
                            ))}
                            <CreateRequestTile />
                        </div>
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
