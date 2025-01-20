import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash } from 'lucide-react';
import Toast from '@/components/Toast';

interface Restaurant {
    id: string;
    name: string;
    resy_venue_id: string;
    thumbnail_url: string | null;
    reservation_open_time?: string;
}

interface RestaurantFormData {
    name: string;
    resy_venue_id: string;
    thumbnail_url: string;
    reservation_open_time?: string;
}

const AdminPortal = () => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
    const [formData, setFormData] = useState<RestaurantFormData>({
        name: '',
        resy_venue_id: '',
        thumbnail_url: '',
        reservation_open_time: ''
    });

    useEffect(() => {
        checkAdminStatus();
        fetchRestaurants();
    }, []);

    const checkAdminStatus = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setIsAdmin(!!user?.user_metadata.is_admin);
        }
    };

    const fetchRestaurants = async () => {
        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .order('name')
            .returns<Restaurant[]>();

        if (error) {
            setToast({ message: 'Error fetching restaurants', type: 'error' });
            return;
        }

        setRestaurants(data || []);
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (editingRestaurant) {
                const { error } = await supabase
                    .from('restaurants')
                    .update({
                        name: formData.name,
                        resy_venue_id: formData.resy_venue_id,
                        thumbnail_url: formData.thumbnail_url || null,
                        reservation_open_time: formData.reservation_open_time
                    })
                    .eq('id', editingRestaurant.id);

                if (error) throw error;
                setToast({ message: 'Restaurant updated successfully', type: 'success' });
            } else {
                const { error } = await supabase
                    .from('restaurants')
                    .insert([{
                        name: formData.name,
                        resy_venue_id: formData.resy_venue_id,
                        thumbnail_url: formData.thumbnail_url || null,
                        reservation_open_time: formData.reservation_open_time
                    }]);

                if (error) throw error;
                setToast({ message: 'Restaurant added successfully', type: 'success' });
            }

            setShowForm(false);
            setEditingRestaurant(null);
            setFormData({
                name: '',
                resy_venue_id: '',
                thumbnail_url: '',
                reservation_open_time: ''
            });
            fetchRestaurants();
        } catch (error: any) {
            setToast({ message: error.message, type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (restaurant: Restaurant) => {
        setEditingRestaurant(restaurant);
        setFormData({
            name: restaurant.name,
            resy_venue_id: restaurant.resy_venue_id,
            thumbnail_url: restaurant.thumbnail_url || '',
            reservation_open_time: restaurant.reservation_open_time
        });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this restaurant?')) return;

        try {
            const { error } = await supabase
                .from('restaurants')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setToast({ message: 'Restaurant deleted successfully', type: 'success' });
            fetchRestaurants();
        } catch (error: any) {
            setToast({ message: error.message, type: 'error' });
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6">
                        <p className="text-center text-gray-600">You don't have permission to access this page.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 text-gray-600 mt-16">
            <Card className="max-w-6xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Restaurant Management</CardTitle>
                    <Button
                        onClick={() => {
                            setShowForm(true);
                            setEditingRestaurant(null);
                            setFormData({
                                name: '',
                                resy_venue_id: '',
                                thumbnail_url: '',
                                reservation_open_time: ''
                            });
                        }}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Restaurant
                    </Button>
                </CardHeader>
                <CardContent>
                    {showForm && (
                        <div className="mb-8 p-4 border rounded-lg bg-white">
                            <h3 className="text-lg font-semibold mb-4">
                                {editingRestaurant ? 'Edit Restaurant' : 'Add New Restaurant'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Resy Venue ID</label>
                                    <input
                                        type="text"
                                        value={formData.resy_venue_id}
                                        onChange={(e) => setFormData(prev => ({ ...prev, resy_venue_id: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
                                    <input
                                        type="url"
                                        value={formData.thumbnail_url}
                                        onChange={(e) => setFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reservation Open Time</label>
                                    <input
                                        type="time"
                                        value={formData.reservation_open_time}
                                        onChange={(e) => setFormData(prev => ({ ...prev, reservation_open_time: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="bg-orange-600 text-gray-700 hover:bg-gray-200"
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? 'Saving...' : (editingRestaurant ? 'Update' : 'Add')}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {restaurants.map((restaurant) => (
                            <div
                                key={restaurant.id}
                                className="flex items-center justify-between p-4 border rounded-lg bg-white"
                            >
                                <div>
                                    <h3 className="font-semibold">{restaurant.name}</h3>
                                    <p className="text-sm text-gray-600">Resy ID: {restaurant.resy_venue_id}</p>
                                    <p className="text-sm text-gray-600">
                                        Reservations Open: {new Date(restaurant.reservation_open_time || "").toLocaleTimeString()}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleEdit(restaurant)}
                                        className="p-2"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(restaurant.id)}
                                        className="p-2 bg-red-600 hover:bg-red-700"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default AdminPortal;
