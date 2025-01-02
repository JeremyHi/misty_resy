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
