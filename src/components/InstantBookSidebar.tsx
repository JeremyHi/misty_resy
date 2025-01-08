// src/components/InstantBookSidebar.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Restaurant } from '@/types/reservation';

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

const SPECIAL_VENUE_IDS = ['63241', '456', '789']; // Example venue IDs

const InstantBookSidebar = () => {
    const [availabilities, setAvailabilities] = useState<RestaurantAvailability[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAvailabilities = async () => {
        try {
            // Get current date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];

            // First, fetch restaurant details from Supabase
            const { data: restaurants } = await supabase
                .from('restaurants')
                .select('*')
                .in('resy_venue_id', SPECIAL_VENUE_IDS);

            if (!restaurants) return;

            // Fetch availability for each restaurant
            const availabilityPromises: Promise<RestaurantAvailability>[] = SPECIAL_VENUE_IDS.map(async (venueId) => {
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

            const results: RestaurantAvailability[] = await Promise.all(availabilityPromises);
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

    const formatTime = (token: string) => {
        // Extract time from token (format: "2025-01-06 16:00:00")
        const time = token.split(' ')[1];
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
                                        onClick={() => {
                                            // Handle reservation booking
                                            console.log('Booking reservation with token:', slot.config.token);
                                        }}
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
    );
};

export default InstantBookSidebar;
