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
