// components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user);
            setLoading(false);
        });
    }, []);

    if (loading) return null;
    if (!user) return <Navigate to="/login" />;

    return <>{children}</>;
};
