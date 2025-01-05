import React, { useState, useEffect, JSX } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { CreditCard, Wallet } from 'lucide-react';

const PaymentMethodsSection = () => {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLinkModal, setShowLinkModal] = useState(false);

    useEffect(() => {
        fetchPaymentMethods();
    }, []);

    const fetchPaymentMethods = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data, error } = await supabase
                .from('payment_methods')
                .select('*')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false })
                .returns<PaymentMethod[]>();

            if (error) throw error;
            setPaymentMethods(data || []);
        } catch (error) {
            console.error('Error fetching payment methods:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlink = async ({ id }: { id: string }) => {
        try {
            const { error } = await supabase
                .from('payment_methods')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchPaymentMethods();
        } catch (error) {
            console.error('Error unlinking payment method:', error);
        }
    };

    interface PaymentMethod {
        id: string;
        type: 'apple_pay' | 'stripe' | 'coinbase';
        card_type?: string;
        last_four?: string;
        wallet_address?: string;
    }

    const renderPaymentMethod = (method: PaymentMethod) => {
        const getIcon = (): JSX.Element | null => {
            switch (method.type) {
                case 'apple_pay':
                case 'stripe':
                    return <CreditCard className="w-6 h-6" />;
                case 'coinbase':
                    return <Wallet className="w-6 h-6" />;
                default:
                    return null;
            }
        };

        const getDisplayText = (): string => {
            switch (method.type) {
                case 'apple_pay':
                case 'stripe':
                    return `${method.card_type} ending in ${method.last_four}`;
                case 'coinbase':
                    return `${method.wallet_address?.slice(0, 6)}...${method.wallet_address?.slice(-4)}`;
                default:
                    return '';
            }
        };

        return (
            <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg mb-4">
                <div className="flex items-center space-x-4">
                    {getIcon()}
                    <div>
                        <p className="font-medium capitalize">{method.type.replace('_', ' ')}</p>
                        <p className="text-sm text-gray-600">{getDisplayText()}</p>
                    </div>
                </div>
                <Button
                    onClick={() => handleUnlink({ id: method.id })}
                    className="bg-red-600 text-white hover:bg-red-700"
                >
                    Unlink
                </Button>
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <p>Loading...</p>
                ) : paymentMethods.length > 0 ? (
                    <div>{paymentMethods.map(renderPaymentMethod)}</div>
                ) : (
                    <p className="text-gray-600 mb-4">No payment methods linked</p>
                )}
                <Button onClick={() => setShowLinkModal(true)}>
                    Add Payment Method
                </Button>
            </CardContent>
        </Card>
    );
};

export default PaymentMethodsSection;
