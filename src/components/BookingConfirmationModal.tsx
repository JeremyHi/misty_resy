import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BookingConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    restaurantName: string;
    date: string;
    time: string;
    partySize: number;
    loading: boolean;
}

const BookingConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    restaurantName,
    date,
    time,
    partySize,
    loading
}: BookingConfirmationModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
                <CardHeader>
                    <CardTitle>Confirm Reservation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold">{restaurantName}</h3>
                            <p className="text-sm text-gray-600">Date: {new Date(date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">Time: {time}</p>
                            <p className="text-sm text-gray-600">Party Size: {partySize}</p>
                        </div>
                        <p className="text-gray-600">Would you like to confirm this reservation?</p>
                        <div className="flex justify-end space-x-3">
                            <Button
                                onClick={onClose}
                                className="bg-red-600 text-white hover:bg-red-700"
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={onConfirm}
                                disabled={loading}
                            >
                                {loading ? 'Confirming...' : 'Confirm Reservation'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BookingConfirmationModal;
