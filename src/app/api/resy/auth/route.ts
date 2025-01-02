// src/app/api/resy/auth/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const body = await request.json()

    try {
        const response = await fetch('https://api.resy.com/3/auth/password', {
            method: 'POST',
            headers: {
                'accept': 'application/json, text/plain, */*',
                'authority': 'api.resy.com',
                'authorization': `ResyAPI api_key="${process.env.NEXT_PUBLIC_RESY_API_KEY}"`,
                'cache-control': 'no-cache',
                'content-type': 'application/x-www-form-urlencoded',
                'dnt': '1',
                'origin': 'https://resy.com',
                'referer': 'https://resy.com/',
                'x-origin': 'https://resy.com'
            },
            body: new URLSearchParams(body)
        })

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to validate credentials' }, { status: 500 })
    }
}
