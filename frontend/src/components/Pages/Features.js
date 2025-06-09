import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Features page component for LabX Educational Platform
 * @returns {React.ReactNode} - The features page component
 */
const Features = () => {
    const { isAuthenticated } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header/Navigation - Same as Home */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Link to="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                                    LabX
                                </Link>
                            </div>
                            <nav className="hidden md:ml-6 md:flex md:space-x-8">
                                <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                                    Home
                                </Link>
                                <Link to="/about" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                                    About
                                </Link>
                                <Link to="/features" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Features
                                </Link>
                            </nav>
                        </div>

                        <div className="hidden md:flex items-center space-x-2">
                            {isAuthenticated() ? (
                                <>
                                    <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Dashboard
                                    </Link>
                                    <Link to="/profile" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Profile
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                        Log in
                                    </Link>
                                    <Link to="/signup" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
                            >
                                <span className="sr-only">Open main menu</span>
                                {!mobileMenuOpen ? (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                ) : (
                                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            <Link to="/" className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                Home
                            </Link>
                            <Link to="/about" className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                About
                            </Link>
                            <Link to="/features" className="text-indigo-600 block px-3 py-2 rounded-md text-base font-medium bg-indigo-50" onClick={() => setMobileMenuOpen(false)}>
                                Features
                            </Link>
                        </div>
                        <div className="pt-4 pb-3 border-t border-gray-200">
                            <div className="px-2 space-y-1">
                                {isAuthenticated() ? (
                                    <>
                                        <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                            Dashboard
                                        </Link>
                                        <Link to="/profile" className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                            Profile
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/login" className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                            Log in
                                        </Link>
                                        <Link to="/signup" className="bg-indigo-600 text-white hover:bg-indigo-700 block px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                            Sign up
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            <main>
                {/* Hero Section */}
                <div className="relative bg-gradient-to-br from-indigo-50 to-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-16 sm:py-20 md:py-24">
                            <div className="text-center">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                                    Powerful{' '}
                                    <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                                        Features
                                    </span>
                                </h1>
                                <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                    Discover the comprehensive suite of tools and technologies that make LabX the ultimate educational platform
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3D Labs Showcase */}
                <div className="py-16 sm:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900">Immersive 3D Virtual Laboratories</h2>
                                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                                    Experience cutting-edge 3D virtual laboratories powered by Unity Engine. Our labs provide realistic physics simulations, interactive equipment, and hands-on learning experiences that rival traditional laboratories.
                                </p>
                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center">
                                        <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-gray-700">Real-time physics simulation</span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-gray-700">Interactive 3D equipment</span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-gray-700">Multi-user collaboration</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12 lg:mt-0">
                                {/* Placeholder for 3D lab demo video */}
                                <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg h-64 lg:h-80 flex items-center justify-center shadow-lg">
                                    <div className="text-center">
                                        <svg className="mx-auto h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="mt-4 text-blue-600 font-medium">3D Lab Demo Video</p>
                                        <p className="text-sm text-blue-500">Unity Engine in Action</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* EECircuit Engine */}
                <div className="py-16 sm:py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                            <div className="lg:order-2">
                                <h2 className="text-3xl font-extrabold text-gray-900">Advanced Circuit Simulation</h2>
                                <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                                    Our proprietary EECircuit Engine provides accurate electronic circuit simulation with real-time analysis. Design, build, and test electronic circuits with professional-grade simulation capabilities.
                                </p>
                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center">
                                        <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span className="text-gray-700">SPICE-level accuracy</span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span className="text-gray-700">Real-time waveform analysis</span>
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span className="text-gray-700">Component library with 1000+ parts</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-12 lg:mt-0 lg:order-1">
                                {/* Placeholder for circuit simulation demo */}
                                <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg h-64 lg:h-80 flex items-center justify-center shadow-lg">
                                    <div className="text-center">
                                        <svg className="mx-auto h-16 w-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                        </svg>
                                        <p className="mt-4 text-green-600 font-medium">Circuit Simulation Demo</p>
                                        <p className="text-sm text-green-500">EECircuit Engine</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Core Features Grid */}
                <div className="py-16 sm:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900">Complete Educational Platform</h2>
                            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                                Everything you need for modern education in one integrated platform
                            </p>
                        </div>

                        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Course Management */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">Course Management</h3>
                                <p className="mt-2 text-gray-600">Create, organize, and manage courses with integrated lab assignments and assessments.</p>
                            </div>

                            {/* Student Progress Tracking */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">Progress Analytics</h3>
                                <p className="mt-2 text-gray-600">Track student performance with detailed analytics and progress reports.</p>
                            </div>

                            {/* Collaborative Learning */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">Collaborative Labs</h3>
                                <p className="mt-2 text-gray-600">Work together in shared virtual lab spaces with real-time collaboration.</p>
                            </div>

                            {/* Assessment Tools */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">Smart Assessments</h3>
                                <p className="mt-2 text-gray-600">Create automated assessments with lab simulations and instant feedback.</p>
                            </div>

                            {/* Cross-Platform Access */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">Cross-Platform</h3>
                                <p className="mt-2 text-gray-600">Access labs from any device - desktop, tablet, or mobile with responsive design.</p>
                            </div>

                            {/* Cloud Infrastructure */}
                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                                <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">Cloud Infrastructure</h3>
                                <p className="mt-2 text-gray-600">Scalable cloud-based platform ensuring 99.9% uptime and global accessibility.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technology Stack */}
                <div className="py-16 sm:py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900">Built with Modern Technology</h2>
                            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                                Leveraging cutting-edge technologies to deliver exceptional performance and user experience
                            </p>
                        </div>

                        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="text-center">
                                <div className="mx-auto h-16 w-16 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">Unity Engine</h3>
                                <p className="mt-2 text-sm text-gray-600">3D Graphics & Physics</p>
                            </div>

                            <div className="text-center">
                                <div className="mx-auto h-16 w-16 bg-green-100 rounded-xl flex items-center justify-center">
                                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">EECircuit Engine</h3>
                                <p className="mt-2 text-sm text-gray-600">Circuit Simulation</p>
                            </div>

                            <div className="text-center">
                                <div className="mx-auto h-16 w-16 bg-cyan-100 rounded-xl flex items-center justify-center">
                                    <svg className="h-8 w-8 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">React.js</h3>
                                <p className="mt-2 text-sm text-gray-600">Frontend Framework</p>
                            </div>

                            <div className="text-center">
                                <div className="mx-auto h-16 w-16 bg-gray-100 rounded-xl flex items-center justify-center">
                                    <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                                    </svg>
                                </div>
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">Node.js</h3>
                                <p className="mt-2 text-sm text-gray-600">Backend Runtime</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Demo Section */}
                <div className="py-16 sm:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900">See LabX in Action</h2>
                            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                                Watch our comprehensive demos showcasing the power of virtual laboratories
                            </p>
                        </div>

                        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Physics Lab Demo */}
                            <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg p-8 shadow-lg">
                                <div className="text-center">
                                    <div className="h-32 flex items-center justify-center">
                                        <svg className="h-16 w-16 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">Physics Laboratory Demo</h3>
                                    <p className="mt-2 text-gray-600">Experience pendulum experiments, wave mechanics, and thermodynamics simulations</p>
                                    <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                                        Watch Demo
                                    </button>
                                </div>
                            </div>

                            {/* Electronics Lab Demo */}
                            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-8 shadow-lg">
                                <div className="text-center">
                                    <div className="h-32 flex items-center justify-center">
                                        <svg className="h-16 w-16 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">Electronics Lab Demo</h3>
                                    <p className="mt-2 text-gray-600">Build circuits, analyze waveforms, and test electronic components with EECircuit Engine</p>
                                    <button className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors">
                                        Watch Demo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-indigo-600">
                    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                Ready to Experience the Future of Education?
                            </h2>
                            <p className="mt-4 text-xl text-indigo-200">
                                Join thousands of educators and students already using LabX's advanced features
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                                <Link to="/signup" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors shadow-lg">
                                    Start Free Trial
                                </Link>
                                <Link to="/about" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition-colors">
                                    Learn More
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-800">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <div className="border-t border-gray-700 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex justify-center sm:justify-start space-x-6 order-2 sm:order-2">
                            <a href="#" className="text-gray-400 hover:text-gray-300 transition-colors">
                                <span className="sr-only">GitHub</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                        <p className="mt-8 sm:mt-0 text-base text-gray-400 text-center sm:text-left order-1 sm:order-1">
                            &copy; 2025 LabX Educational Platform. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Features;