// src/app/api/resy/auth/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const body = await request.json()

    try {
        const response = await fetch('https://api.resy.com/3/auth/password', {
            method: 'POST',
            headers: {
                'authority': 'api.resy.com',
                'accept': 'application/json',
                'authorization': `ResyAPI api_key="${process.env.NEXT_PUBLIC_RESY_API_KEY}"`,
                'content-type': 'application/x-www-form-urlencoded',
                'origin': 'https://resy.com',
                'referer': 'https://resy.com/',
            },
            body: new URLSearchParams(body)
        })

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to validate credentials' }, { status: 500 })
    }
}
