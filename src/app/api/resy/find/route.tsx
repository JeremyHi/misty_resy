// src/app/api/resy/find/route.ts
import { NextResponse } from 'next/server';

interface ResySlotConfig {
    id: number;
    custom_config_name: string | null;
    token: string;
    type: string;
}

interface ResyDateDetails {
    end: string;
    start: string;
}

interface ResyVenueSlot {
    config: ResySlotConfig;
    date: ResyDateDetails;
}

interface ResyVenue {
    slots: ResyVenueSlot[];
}

interface ResyFindResponse {
    results: {
        venues: ResyVenue[];
    };
    query: {
        day: string;
        party_size: number;
        time_filter: string | null;
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day');
    const party_size = searchParams.get('party_size');
    const venue_id = searchParams.get('venue_id');

    // Validate required parameters
    if (!day || !party_size || !venue_id) {
        return NextResponse.json(
            { error: 'Missing required parameters: day, party_size, and venue_id are required' },
            { status: 400 }
        );
    }

    try {
        if (process.env.NEXT_PUBLIC_ENV === 'prod') {
            const response = await fetch(
                `https://api.resy.com/4/find?lat=0&long=0&day=${day}&party_size=${party_size}&venue_id=${venue_id}`,
                {
                    headers: {
                        'accept': 'application/json, text/plain, */*',
                        'authority': 'api.resy.com',
                        'accept-language': 'en-US,en;q=0.9,ja;q=0.8',
                        'authorization': `ResyAPI api_key="${process.env.NEXT_PUBLIC_RESY_API_KEY}"`,
                        'cache-control': 'no-cache',
                        'content-type': 'application/json',
                        'dnt': '1',
                        'origin': 'https://resy.com',
                        'priority': 'u=1, i',
                        'referer': 'https://resy.com/',
                        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                        'x-origin': 'https://resy.com'
                    }
                }
            );

            const data: ResyFindResponse = await response.json();

            // Extract only the slot configs from the first venue
            const slots: ResyVenueSlot[] = data.results.venues[0]?.slots || [];

            return NextResponse.json({
                slots: slots,
                query: data.query
            });
        } else {
            // Return mock data for non-prod environment
            return NextResponse.json({
                slots: [
                    {
                        config: {
                            id: 1098334,
                            custom_config_name: null,
                            token: "rgs://resy/63241/1739423/3/2025-01-06/2025-01-06/16:00:00/2/Dining Room",
                            type: "Dining Room"
                        },
                        date: {
                            end: "2025-01-06 17:30:00",
                            start: "2025-01-06 16:00:00"
                        }
                    }
                ], query: { day: "2025-01-06", party_size: 2, time_filter: null }
            });
        }
    } catch (error) {
        console.error('Error fetching Resy data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reservation data' },
            { status: 500 }
        );
    }
}
