import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Dashboard page component
 * @returns {React.ReactNode} - The dashboard page component
 */
const Dashboard = () => {
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Sample data for the dashboard
    const stats = [
        { name: 'Total Users', stat: '71,897' },
        { name: 'Avg. Open Rate', stat: '58.16%' },
        { name: 'Avg. Click Rate', stat: '24.57%' }
    ];

    const projects = [
        { id: 1, name: 'Project Alpha', status: 'Active', lastUpdated: '3h ago' },
        { id: 2, name: 'Project Beta', status: 'Planning', lastUpdated: '1d ago' },
        { id: 3, name: 'Project Gamma', status: 'Completed', lastUpdated: '2w ago' }
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile sidebar */}
            <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
                <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            type="button"
                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <span className="sr-only">Close sidebar</span>
                            <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                        <div className="flex-shrink-0 flex items-center px-4">
                            <h1 className="text-xl font-bold text-gray-900">My Application</h1>
                        </div>
                        <nav className="mt-5 px-2 space-y-1">
                            <Link to="/dashboard" className="bg-indigo-100 text-indigo-900 group flex items-center px-2 py-2 text-base font-medium rounded-md">
                                Dashboard
                            </Link>
                            <Link to="/profile" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md">
                                Profile
                            </Link>
                            <Link to="/settings" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md">
                                Settings
                            </Link>
                        </nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <button
                            onClick={logout}
                            className="flex-shrink-0 group block text-red-600 hover:text-red-700"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <h1 className="text-xl font-bold text-gray-900">My Application</h1>
                        </div>
                        <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                            <Link to="/dashboard" className="bg-indigo-100 text-indigo-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                Dashboard
                            </Link>
                            <Link to="/profile" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                Profile
                            </Link>
                            <Link to="/settings" className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md">
                                Settings
                            </Link>
                        </nav>
                    </div>
                    <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                        <button
                            onClick={logout}
                            className="flex-shrink-0 group block text-red-600 hover:text-red-700"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="md:pl-64 flex flex-col flex-1">
                <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
                    <button
                        type="button"
                        className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <span className="sr-only">Open sidebar</span>
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
                <main className="flex-1">
                    <div className="py-6">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                        </div>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                            {/* Stats */}
                            <div className="mt-8">
                                <h2 className="text-lg leading-6 font-medium text-gray-900">Overview</h2>
                                <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-3">
                                    {stats.map((item) => (
                                        <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                                            <div className="px-4 py-5 sm:p-6">
                                                <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                                                <dd className="mt-1 text-3xl font-semibold text-gray-900">{item.stat}</dd>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Projects */}
                            <div className="mt-8">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg leading-6 font-medium text-gray-900">Projects</h2>
                                    <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                                        New Project
                                    </button>
                                </div>
                                <div className="mt-4 flex flex-col">
                                    <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                                            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Name
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Status
                                                            </th>
                                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Last Updated
                                                            </th>
                                                            <th scope="col" className="relative px-6 py-3">
                                                                <span className="sr-only">Edit</span>
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {projects.map((project) => (
                                                            <tr key={project.id}>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${project.status === 'Active' ? 'bg-green-100 text-green-800' :
                                                                        project.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                        {project.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                    {project.lastUpdated}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                                    <a href="#" className="text-indigo-600 hover:text-indigo-900">Edit</a>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard; 