// src/components/InstantBookSidebar.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types/reservation';
import BookingConfirmationModal from './BookingConfirmationModal';

interface SlotConfig {
    config: {
        id: number;
        token: string;
        type: string;
    }
    date: {
        end: string;
        start: string;
    }
}

interface RestaurantAvailability {
    restaurant: Restaurant;
    slots: SlotConfig[];
    query: {
        day: string;
        party_size: number;
        time_filter: string | null;
    };
}

interface BookingDetails {
    restaurantName: string;
    date: string;
    time: string;
    partySize: number;
    token: string;
}

const SPECIAL_VENUE_IDS = ['63241', '1505']; // Example venue IDs

const InstantBookSidebar = () => {
    const [availabilities, setAvailabilities] = useState<RestaurantAvailability[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [bookToken, setBookToken] = useState<string | null>(null);

    const fetchAvailabilities = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];

            const { data: restaurants } = await supabase
                .from('restaurants')
                .select('*')
                .in('resy_venue_id', SPECIAL_VENUE_IDS);

            if (!restaurants) return;

            const availabilityPromises = SPECIAL_VENUE_IDS.map(async (venueId) => {
                const response = await fetch(
                    `/api/resy/find?day=${today}&party_size=2&venue_id=${venueId}`
                );
                const data = await response.json();
                const restaurant = restaurants.find(r => r.resy_venue_id === venueId);

                return {
                    restaurant: restaurant || { id: venueId, name: 'Unknown' },
                    slots: data.slots || [],
                    query: data.query
                } as RestaurantAvailability;
            });

            const results = await Promise.all(availabilityPromises);
            setAvailabilities(results.filter(result => result.slots.length > 0));
        } catch (error) {
            console.error('Error fetching availabilities:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailabilities();
    }, []);

    const handleBookingClick = async (
        restaurant: Restaurant,
        slot: SlotConfig,
        partySize: number
    ) => {
        try {
            // Fetch user's Resy token
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data: resyCreds } = await supabase
                .from('resy_credentials')
                .select('token')
                .eq('user_id', user.id)
                .single();

            if (!resyCreds?.token) throw new Error('Resy credentials not found');

            const bookingDate = slot.date.start.split(' ')[0];
            setBookingDetails({
                restaurantName: restaurant.name,
                date: bookingDate,
                time: new Date(slot.date.start).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                }),
                partySize: partySize,
                token: slot.config.token
            });

            // Get book token
            const response = await fetch('/api/resy/details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    commit: 1,
                    config_id: slot.config.token,
                    day: bookingDate,
                    party_size: partySize.toString(),
                    auth_token: resyCreds.token
                })
            });

            const data = await response.json();
            if (!data.book_token?.value) {
                throw new Error('Failed to get booking token');
            }

            setBookToken(data.book_token.value);
            setShowConfirmModal(true);

        } catch (error) {
            console.error('Error preparing booking:', error);
            // Handle error (show toast, etc.)
        }
    };

    const handleConfirmBooking = async () => {
        if (!bookingDetails || !bookToken) return;

        setConfirmLoading(true);
        try {
            // Here you would make the final booking API call using the book_token
            // For now, we'll just close the modal
            console.log('Making final booking with token:', bookToken);

            setShowConfirmModal(false);
            setBookingDetails(null);
            setBookToken(null);
            // Refresh availabilities after successful booking
            await fetchAvailabilities();
        } catch (error) {
            console.error('Error confirming booking:', error);
            // Handle error (show toast, etc.)
        } finally {
            setConfirmLoading(false);
        }
    };

    const formatTime = (dateTime: string) => {
        const time = dateTime.split(' ')[1];
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours));
        date.setMinutes(parseInt(minutes));
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <p>Loading available reservations...</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm p-6 w-full p-4 text-gray-600">
                <h2 className="text-xl font-bold mb-4">Instant Book</h2>
                <div className="space-y-4">
                    {availabilities.map((availability) => (
                        <Card key={availability.restaurant.id} className="overflow-hidden">
                            <div className="relative h-32">
                                <img
                                    src={availability.restaurant.thumbnail_url || '/api/placeholder/400/320'}
                                    alt={availability.restaurant.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-semibold mb-2">{availability.restaurant.name}</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {availability.slots.map((slot) => (
                                        <Button
                                            key={slot.config.id}
                                            className="w-full"
                                            onClick={() => handleBookingClick(
                                                availability.restaurant,
                                                slot,
                                                availability.query.party_size
                                            )}
                                        >
                                            {formatTime(slot.date.start)} - Size: {availability.query.party_size}
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {bookingDetails && (
                <BookingConfirmationModal
                    isOpen={showConfirmModal}
                    onClose={() => {
                        setShowConfirmModal(false);
                        setBookingDetails(null);
                        setBookToken(null);
                    }}
                    onConfirm={handleConfirmBooking}
                    restaurantName={bookingDetails.restaurantName}
                    date={bookingDetails.date}
                    time={bookingDetails.time}
                    partySize={bookingDetails.partySize}
                    loading={confirmLoading}
                />
            )}
        </>
    );
};

export default InstantBookSidebar;
