// src/app/api/resy/auth/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
    const body = await request.json()

    try {
        if (process.env.NEXT_PUBLIC_ENV == 'prod') {
            const response = await fetch('https://api.resy.com/3/auth/password', {
                method: 'POST',
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'authority': 'api.resy.com',
                    'accept-language': 'en-US,en;q=0.9,ja;q=0.8',
                    'authorization': `ResyAPI api_key="${process.env.NEXT_PUBLIC_RESY_API_KEY}"`,
                    'cache-control': 'no-cache',
                    'content-type': 'application/x-www-form-urlencoded',
                    'dnt': '1',
                    'origin': 'https://resy.com',
                    'priority': 'u=1, i',
                    'referer': 'https://resy.com/',
                    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                    'x-origin': 'https://resy.com'
                },
                body: new URLSearchParams(body)
            });

            const resyData = await response.json()

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { error: dbError } = await supabase
                .from('resy_credentials')
                .upsert({
                    user_id: user.id,
                    email: body.email,
                    encrypted_password: body.password,
                    token: resyData.token,
                    refresh_token: resyData.refresh_token,
                    legacy_token: resyData.legacy_token,
                    profile_image_url: resyData.profile_image_url
                });

            if (dbError) throw dbError;
            return NextResponse.json(resyData)
        }
        else {
            const response = {
                status: 200,
                json: async () => ({ success: true })
            };

            const data = await response.json()
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to validate credentials' }, { status: 500 })
    }
}
