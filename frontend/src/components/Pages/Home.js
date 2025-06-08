import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Home page component for LabX Educational Platform
 * @returns {React.ReactNode} - The home page component
 */
const Home = () => {
    const { isAuthenticated } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header/Navigation */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                                    LabX
                                </h1>
                            </div>
                            {/* Desktop Navigation */}
                            <nav className="hidden md:ml-6 md:flex md:space-x-8">
                                <Link to="/" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                    Home
                                </Link>
                                <Link to="/about" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                                    About
                                </Link>
                                <Link to="/features" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
                                    Features
                                </Link>
                            </nav>
                        </div>

                        {/* Desktop Auth Buttons */}
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

                        {/* Mobile menu button */}
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
                            <Link to="/" className="text-indigo-600 block px-3 py-2 rounded-md text-base font-medium bg-indigo-50" onClick={() => setMobileMenuOpen(false)}>
                                Home
                            </Link>
                            <Link to="/about" className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
                                About
                            </Link>
                            <Link to="/features" className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium transition-colors" onClick={() => setMobileMenuOpen(false)}>
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

            {/* Hero Section */}
            <main>
                <div className="relative bg-gradient-to-br from-indigo-50 to-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-16 sm:py-20 md:py-24 lg:py-32">
                            <div className="text-center">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
                                    Experience Learning in{' '}
                                    <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                                        3D Interactive Labs
                                    </span>
                                </h1>
                                <p className="mt-6 sm:mt-8 text-lg sm:text-xl text-gray-600 max-w-3xl lg:max-w-4xl mx-auto leading-relaxed">
                                    LabX revolutionizes education by combining traditional course management with cutting-edge 3D virtual laboratories. 
                                    Conduct real experiments safely, access expensive equipment virtually, and learn through immersive experiences.
                                </p>
                                <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-4 px-4">
                                    <Link to="/signup" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                                        Start Learning Today
                                    </Link>
                                    <Link to="/features" className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                                        Explore 3D Labs
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Benefits Section */}
                <div className="py-16 sm:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                                Why Choose LabX?
                            </h2>
                            <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
                                The future of education is here with immersive 3D laboratory experiences
                            </p>
                        </div>

                        <div className="mt-16 sm:mt-20">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                                {/* Benefits remain the same but with better spacing for mobile */}
                                <div className="text-center px-4">
                                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-6 text-xl font-semibold text-gray-900">Virtual Laboratory Access</h3>
                                    <p className="mt-4 text-gray-600 leading-relaxed">
                                        Access expensive lab equipment and conduct experiments in a safe, controlled 3D environment available 24/7.
                                    </p>
                                </div>

                                <div className="text-center px-4">
                                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-6 text-xl font-semibold text-gray-900">Comprehensive Course Management</h3>
                                    <p className="mt-4 text-gray-600 leading-relaxed">
                                        Complete platform for teachers to create courses, manage students, and track progress with integrated lab experiences.
                                    </p>
                                </div>

                                <div className="text-center px-4">
                                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-6 text-xl font-semibold text-gray-900">Safe Learning Environment</h3>
                                    <p className="mt-4 text-gray-600 leading-relaxed">
                                        Practice dangerous or complex procedures without safety risks, with unlimited attempts to master concepts.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rest of the sections remain similar with improved mobile spacing */}
                {/* Features Section */}
                <div className="py-16 sm:py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Platform Features</h2>
                            <p className="mt-2 text-3xl sm:text-4xl leading-8 font-extrabold tracking-tight text-gray-900">
                                Everything you need for modern education
                            </p>
                            <p className="mt-4 max-w-3xl text-xl text-gray-600 mx-auto">
                                From 3D interactive labs to comprehensive course management, LabX provides all the tools for effective online learning.
                            </p>
                        </div>

                        <div className="mt-16 sm:mt-20">
                            <div className="space-y-12 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 lg:gap-x-12 md:gap-y-12">
                                {/* Feature items with better mobile layout */}
                                <div className="relative flex items-start">
                                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-500 text-white shadow-lg">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">3D Interactive Laboratory</h3>
                                        <p className="mt-2 text-base text-gray-600 leading-relaxed">
                                            Experience realistic laboratory simulations with physics-based interactions, virtual equipment, and real-time results.
                                        </p>
                                    </div>
                                </div>

                                {/* Repeat for other features with similar improvements */}
                                <div className="relative flex items-start">
                                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-500 text-white shadow-lg">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Secure Authentication</h3>
                                        <p className="mt-2 text-base text-gray-600 leading-relaxed">
                                            Complete authentication system with JWT tokens, Google OAuth integration, and role-based access control.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative flex items-start">
                                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-500 text-white shadow-lg">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Course Management</h3>
                                        <p className="mt-2 text-base text-gray-600 leading-relaxed">
                                            Create and manage courses, enroll students, assign tasks, and integrate 3D lab experiences seamlessly.
                                        </p>
                                    </div>
                                </div>

                                <div className="relative flex items-start">
                                    <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-500 text-white shadow-lg">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">Progress Tracking</h3>
                                        <p className="mt-2 text-base text-gray-600 leading-relaxed">
                                            Monitor student performance in both traditional assignments and virtual lab exercises with detailed analytics.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-indigo-600">
                    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
                        <div className="lg:flex lg:items-center lg:justify-between">
                            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                <span className="block">Ready to revolutionize education?</span>
                                <span className="block text-indigo-200 mt-2">Start using LabX today.</span>
                            </h2>
                            <div className="mt-8 lg:mt-0 lg:flex-shrink-0">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link to="/signup" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors shadow-lg">
                                        Get started for free
                                    </Link>
                                    <Link to="/features" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition-colors">
                                        Learn more
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-white py-16 sm:py-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900">
                                Trusted by Educational Institutions
                            </h2>
                            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
                                <div className="px-4">
                                    <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">24/7</div>
                                    <div className="mt-2 text-lg text-gray-600">Lab Access</div>
                                </div>
                                <div className="px-4">
                                    <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">100%</div>
                                    <div className="mt-2 text-lg text-gray-600">Safe Experiments</div>
                                </div>
                                <div className="px-4">
                                    <div className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">∞</div>
                                    <div className="mt-2 text-lg text-gray-600">Practice Attempts</div>
                                </div>
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

export default Home;