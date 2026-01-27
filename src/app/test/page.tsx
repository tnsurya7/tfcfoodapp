export default function TestPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">TFC Food Ordering</h1>
                <p className="text-xl text-gray-600">Test Page - Deployment Working!</p>
                <div className="mt-8">
                    <a href="/menu" className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600">
                        Go to Menu
                    </a>
                </div>
            </div>
        </div>
    );
}