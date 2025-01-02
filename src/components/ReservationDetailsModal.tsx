import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReservationHistoryItem } from '@/types/reservation';

interface ReservationDetailsModalProps {
    reservation: ReservationHistoryItem;
    onClose: () => void;
}

const ReservationDetailsModal: React.FC<ReservationDetailsModalProps> = ({ reservation, onClose }) => {
    const formatTime = (time: string): string => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                <Card>
                    <CardHeader className="space-y-1">
                        {reservation.restaurant.thumbnail_url && (
                            <div className="w-full h-48 relative">
                                <img
                                    src={reservation.restaurant.thumbnail_url}
                                    alt={reservation.restaurant.name}
                                    className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
                                />
                            </div>
                        )}
                        <CardTitle className="text-xl font-bold">{reservation.restaurant.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Party Size: {reservation.party_size}</p>
                                <p className="text-sm text-gray-600">
                                    Date: {new Date(reservation.desired_date).toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Request Made: {new Date(reservation.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Requested Times:</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {reservation.desired_times.map((time) => (
                                        <span
                                            key={time}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                        >
                                            {formatTime(time)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700">Status:</p>
                                <span className={`px-2 py-1 rounded-full text-sm ${reservation.status === 'successful' ? 'bg-green-100 text-green-800' :
                                    reservation.status === 'expired' ? 'bg-red-100 text-red-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {reservation.status}
                                </span>
                            </div>
                            {reservation.booking_reference && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Booking Reference:</p>
                                    <p className="text-sm text-gray-600">#{reservation.booking_reference}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button onClick={onClose}>Close</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ReservationDetailsModal;
