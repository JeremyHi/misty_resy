import * as React from "react"
import { Check, X as CloseIcon, AlertTriangle } from "lucide-react"

interface ToastProps {
    message: string
    type?: 'success' | 'error' | 'warning'
    onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose()
        }, 5000)

        return () => clearTimeout(timer)
    }, [onClose])

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <Check className="h-5 w-5 text-green-500" />
            case 'error':
                return <AlertTriangle className="h-5 w-5 text-red-500" />
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />
        }
    }

    const getColors = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200'
            case 'error':
                return 'bg-red-50 border-red-200'
            case 'warning':
                return 'bg-yellow-50 border-yellow-200'
        }
    }

    return (
        <div className={`fixed bottom-4 right-4 flex items-center space-x-2 p-4 rounded-lg border ${getColors()} shadow-lg z-50`}>
            {getIcon()}
            <span className="text-gray-700">{message}</span>
            <button
                onClick={onClose}
                className="ml-2 text-gray-400 hover:text-gray-600"
            >
                <CloseIcon className="h-4 w-4" />
            </button>
        </div>
    )
}

export default Toast;
