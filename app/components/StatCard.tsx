'use client'

interface StatCardProps {
    title: string
    value: number
    icon: string
    color?: 'blue' | 'green' | 'purple' | 'orange'
}

export default function StatCard({ title, value, icon, color = 'blue' }: StatCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    }

    const bgColor = colorClasses[color]

    return (
        <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${bgColor}`}>
                    <span className="text-2xl">{icon}</span>
                </div>
            </div>
        </div>
    )
}
