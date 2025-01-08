# ContextForge Compilation: app

## Compilation Metadata

- Compilation Date: 2025-01-07T20:15:24.017343
- Total Files: 15
- Processed Files: 12
- Ignored Files: 3
- Compilation Time: 0.14 seconds
- Total Tokens: 2515

## File Contents

## File: login/page.tsx

Location: `/Users/jeremyhitchcock/Github/misty_resy/src/app/login/page.tsx`

```tsx
// src/app/login/page.tsx
'use client'
import { AuthForm } from '@/components/AuthForm'

export default function LoginPage() {
    return <AuthForm type="login" />;
}

```

## File: new-request/page.tsx

Location: `/Users/jeremyhitchcock/Github/misty_resy/src/app/new-request/page.tsx`

```tsx
'use client'
import NewRequestPage from '@/components/NewRequestPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'

export default function NewRequest() {
    return (
        <ProtectedRoute>
            <NewRequestPage />
        </ProtectedRoute>
    )
}

```

## File: admin/page.tsx

Location: `/Users/jeremyhitchcock/Github/misty_resy/src/app/admin/page.tsx`

```tsx
'use client'
import AdminPortal from '@/components/AdminPortal'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'

export default function AdminPage() {
    return (
        <ProtectedRoute>
            <Navbar />
            <AdminPortal />
        </ProtectedRoute>
    )
}

```

## File: api/auth/signup/route.ts

Location: `/Users/jeremyhitchcock/Github/misty_resy/src/app/api/auth/signup/route.ts`

```typescript
// src/app/api/auth/signup/route.ts
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
    const body = await request.json()

    try {
        const { data, error } = await supabase.auth.signUp({
            email: body.email,
            password: body.password,
            options: {
                data: {
                    is_admin: false,
                },
            }
        })

        if (error) throw error
        return NextResponse.json(data)
    } catch (error: Error | any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

```

## File: layout.tsx

Location: `/Users/jeremyhitchcock/Github/misty_resy/src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Misty: Your Personal AI Reservations Assistant",
  description: "Created By JeremyHi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

```

## File: signup/page.tsx

Location: `/Users/jeremyhitchcock/Github/misty_resy/src/app/signup/page.tsx`

```tsx
// src/app/signup/page.tsx
'use client'
import { AuthForm } from '@/components/AuthForm'

export default function SignupPage() {
    return <AuthForm type="signup" />;
}

```

## File: page.tsx

Location: `/Users/jeremyhitchcock/Github/misty_resy/src/app/page.tsx`

```tsx
'use client'
import HomePage from '../components/HomePage'

export default function Home() {
  return <HomePage />;
}

```

## File: resy-credentials/page.tsx

Location: `/Users/jeremyhitchcock/Github/misty_resy/src/app/resy-credentials/page.tsx`

```tsx
// src/app/resy-credentials/page.tsx
'use client'
import { ResyCredentialsForm } from '@/components/ResyCredentialsForm'

export default function ResyCredentialsPage() {
    return <ResyCredentialsForm />;
}

```

## File: profile/page.tsx

Location: `/Users/jeremyhitchcock/Github/misty_resy/src/app/profile/page.tsx`

```tsx
'use client'
import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ProfilePage from '@/components/ProfilePage';

export default function Profile() {
    return (
        <ProtectedRoute>
            <ProfilePage />
        </ProtectedRoute>
    );
}

```

## File: dashboard/page.tsx

Location: `/Users/jeremyhitchcock/Github/misty_resy/src/app/dashboard/page.tsx`

```tsx
// src/app/dashboard/page.tsx
'use client'
import Dashboard from '@/components/Dashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    );
}

```

## File: api/resy/auth/route.ts

Location: `/Users/jeremyhitchcock/Github/misty_resy/src/app/api/resy/auth/route.ts`

```typescript
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

```

## File: api/resy/find/route.tsx

Location: `/Users/jeremyhitchcock/Github/misty_resy/src/app/api/resy/find/route.tsx`

```tsx
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

```

