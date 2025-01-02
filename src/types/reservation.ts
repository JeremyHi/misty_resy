export interface ReservationHistoryItem {
    id: string;
    restaurant: Restaurant;
    created_at: string;
    status: 'active' | 'successful' | 'expired';
    party_size: number;
    desired_date: string;
    desired_times: string[];
    booking_reference?: string;
}

export interface Restaurant {
    id: string;
    name: string;
    thumbnail_url?: string;
}

export interface ReservationRequest {
    id: string;
    user_id: string;
    created_at: string;
    status: string;
    party_size: number;
    desired_date: string;
    desired_times: string[];
    booking_reference: string;
    restaurants: Restaurant;
}
