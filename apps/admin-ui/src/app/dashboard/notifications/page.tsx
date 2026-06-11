import React from 'react'

const BreadCrumbs = ({ title }: { title: string }) => (
    <nav className="text-gray-400 text-sm">
        <span>Dashboard</span> / <span className="text-white">{title}</span>
    </nav>
)

const Notifications = () => {
    return (
        <div className="w-full min-h-screen p-8">
            <h2 className="text-2xl text-white font-semibold mb-2">Notifications</h2>
            {/* Breadcrumbs */}
            <BreadCrumbs title="Notifications" />

            <p className="text-center pt-24 text-white text-sm font-Poppins">
                No Notifications available yet!
            </p>
        </div>
    )
}

export default Notifications