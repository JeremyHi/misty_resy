import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreditCard, Wallet } from 'lucide-react';

interface AddPaymentMethodModalProps {
    onClose: () => void;
    onSuccess?: () => void;
}

const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({ onClose, onSuccess }) => {
    const paymentOptions = [
        {
            type: 'apple_pay',
            title: 'Apple Pay',
            icon: <CreditCard className="w-6 h-6" />,
            handler: () => {
                // Implement Apple Pay integration
            }
        },
        {
            type: 'stripe',
            title: 'Credit Card',
            icon: <CreditCard className="w-6 h-6" />,
            handler: () => {
                // Implement Stripe integration
            }
        },
        {
            type: 'coinbase',
            title: 'Coinbase Wallet',
            icon: <Wallet className="w-6 h-6" />,
            handler: () => {
                // Implement Coinbase Wallet integration
            }
        }
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Add Payment Method</h2>
                <div className="space-y-4">
                    {paymentOptions.map((option) => (
                        <button
                            key={option.type}
                            onClick={option.handler}
                            className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center space-x-3">
                                {option.icon}
                                <span>{option.title}</span>
                            </div>
                            <CreditCard className="w-5 h-5 text-gray-400" />
                        </button>
                    ))}
                </div>
                <div className="mt-6 flex justify-end">
                    <Button onClick={onClose} className="mr-2">
                        Cancel
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default AddPaymentMethodModal;
