// src/app/api/auth/signup/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
    const body = await request.json()

    try {
        const { data, error } = await supabase.auth.signUp({
            email: body.email,
            password: body.password
        })

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: Error | any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
