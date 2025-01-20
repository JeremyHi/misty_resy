// src/app/api/resy/details/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { config_id, day, party_size, auth_token } = body;

        if (process.env.NEXT_PUBLIC_ENV === 'prod') {
            const response = await fetch('https://api.resy.com/3/details', {
                method: 'POST',
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'en-US,en;q=0.9,ja;q=0.8',
                    'authorization': `ResyAPI api_key="${process.env.NEXT_PUBLIC_RESY_API_KEY}"`,
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    'dnt': '1',
                    'origin': 'https://widgets.resy.com',
                    'priority': 'u=1, i',
                    'referer': 'https://widgets.resy.com/',
                    'x-origin': 'https://widgets.resy.com',
                    'x-resy-auth-token': auth_token,
                    'x-resy-universal-auth': auth_token
                },
                body: JSON.stringify({
                    commit: 1,
                    config_id: config_id,
                    day: day,
                    party_size: party_size
                })
            });

            const data = await response.json();
            return NextResponse.json(data);
        } else {
            // Return mock data for development
            return NextResponse.json({
                book_token: {
                    value: 'mock_booking_token_123'
                }
            });
        }
    } catch (error) {
        console.error('Error in details endpoint:', error);
        return NextResponse.json(
            { error: 'Failed to get booking details' },
            { status: 500 }
        );
    }
}
