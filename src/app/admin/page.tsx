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
