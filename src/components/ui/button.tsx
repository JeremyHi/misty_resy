// src/components/ui/button.tsx
import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium 
                focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none 
                disabled:opacity-50 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 
                ${className || ''}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
