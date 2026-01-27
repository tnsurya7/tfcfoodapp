export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-red-900 text-white">
            <div className="container mx-auto px-4 py-20">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        TFC Food Ordering
                    </h1>
                    <p className="text-xl md:text-2xl mb-8 text-gray-100">
                        Delicious food delivered fast to your doorstep!
                    </p>
                    <div className="space-y-4">
                        <a 
                            href="/menu" 
                            className="inline-block bg-white text-red-600 font-bold px-8 py-4 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            Browse Menu
                        </a>
                        <br />
                        <a 
                            href="/admin" 
                            className="inline-block bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-red-600 transition-colors"
                        >
                            Admin Panel
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
