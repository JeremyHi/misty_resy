// src/components/HomePage.tsx
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'

const HomePage = () => {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="pt-20 pb-12 md:pt-40 md:pb-20">
                    <div className="text-center">
                        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                            <span className="block">Automated Restaurant</span>
                            <span className="block text-blue-600">Reservations Made Easy</span>
                        </h1>
                        <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                            Set up automated booking for your favorite restaurants. Never miss out on getting that perfect reservation time again.
                        </p>
                        <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                            <div className="rounded-md shadow">
                                <Button
                                    onClick={() => router.push('/signup')}
                                    className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                                >
                                    Get Started
                                </Button>
                            </div>
                            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                                <Button
                                    onClick={() => router.push('/login')}
                                    className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-blue-600 bg-gray-900 hover:bg-gray-800 md:py-4 md:text-lg md:px-10"
                                >
                                    Sign In
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage
