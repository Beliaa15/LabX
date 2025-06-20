import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * About page component for LabX Educational Platform
 * @returns {React.ReactNode} - The about page component
 */
const About = () => {
    const { isAuthenticated } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <Helmet>
                <title>About LabX - Virtual Laboratory Platform | Our Mission & Vision</title>
                <meta name="description" content="Learn about LabX's mission to revolutionize education through 3D virtual laboratories. Discover our team, values, and commitment to accessible, innovative learning." />
                <meta name="keywords" content="about LabX, virtual laboratory mission, 3D education, online learning platform, educational technology" />
                <meta property="og:title" content="About LabX - Virtual Laboratory Platform" />
                <meta property="og:description" content="Revolutionizing education through 3D virtual laboratories. Safe, accessible, and innovative learning experiences." />
            </Helmet>
            <div className="min-h-screen bg-white">
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
                                    <Link to="/about" className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                                        About
                                    </Link>
                                    <Link to="/features" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors">
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
                                <Link to="/about" className="text-indigo-600 block px-3 py-2 rounded-md text-base font-medium bg-indigo-50" onClick={() => setMobileMenuOpen(false)}>
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

                <main>
                    {/* Hero Section */}
                    <div className="relative bg-gradient-to-br from-indigo-50 to-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="py-16 sm:py-20 md:py-24">
                                <div className="text-center">
                                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                                        About{' '}
                                        <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-transparent">
                                            LabX
                                        </span>
                                    </h1>
                                    <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                        Revolutionizing education through immersive 3D virtual laboratories and comprehensive course management
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mission Section */}
                    <div className="py-16 sm:py-20 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                                <div>
                                    <h2 className="text-3xl font-extrabold text-gray-900">Our Mission</h2>
                                    <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                                        LabX is dedicated to transforming traditional education by providing accessible, safe, and cost-effective virtual laboratory experiences. We believe that every student should have access to high-quality laboratory equipment and experiments, regardless of geographical or financial constraints.
                                    </p>
                                    <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                                        Our platform combines cutting-edge 3D technology with comprehensive course management tools to create an immersive learning environment that prepares students for real-world challenges.
                                    </p>
                                </div>
                                <div className="mt-12 lg:mt-0">
                                    {/* Placeholder for mission video/image */}
                                    <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg h-64 lg:h-80 flex items-center justify-center shadow-lg">
                                        <div className="text-center">
                                            <svg className="mx-auto h-16 w-16 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <p className="mt-4 text-indigo-600 font-medium">Mission Overview Video</p>
                                            <p className="text-sm text-indigo-500">Coming Soon</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Technology Stack Section */}
                    <div className="py-16 sm:py-20 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center">
                                <h2 className="text-3xl font-extrabold text-gray-900">Powered by Cutting-Edge Technology</h2>
                                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                                    Our platform leverages the latest technologies to deliver unparalleled educational experiences
                                </p>
                            </div>

                            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {/* Unity Technology */}
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <div className="flex items-center justify-center h-16 w-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl mx-auto shadow-lg">
                                        <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                        </svg>
                                    </div>
                                    <h3 className="mt-6 text-xl font-semibold text-gray-900 text-center">Unity 3D Engine</h3>
                                    <p className="mt-4 text-gray-600 text-center leading-relaxed">
                                        Industry-leading 3D engine powering our immersive virtual laboratories with realistic physics simulations and interactive environments.
                                    </p>
                                </div>

                                {/* EECircuit Engine */}
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <div className="flex items-center justify-center h-16 w-16 bg-gradient-to-br from-green-100 to-green-50 rounded-xl mx-auto shadow-lg">
                                        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-6 text-xl font-semibold text-gray-900 text-center">EECircuit Engine</h3>
                                    <p className="mt-4 text-gray-600 text-center leading-relaxed">
                                        Specialized electronic circuit simulation engine providing accurate electrical behavior modeling for electronics and engineering labs.
                                    </p>
                                </div>

                                {/* React & Node.js */}
                                <div className="bg-white rounded-lg shadow-lg p-6">
                                    <div className="flex items-center justify-center h-16 w-16 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl mx-auto shadow-lg">
                                        <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-6 text-xl font-semibold text-gray-900 text-center">Modern Web Stack</h3>
                                    <p className="mt-4 text-gray-600 text-center leading-relaxed">
                                        Built with React.js, Node.js, and MongoDB for a seamless, responsive, and scalable web experience across all devices.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Section */}
                    <div className="py-16 sm:py-20 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center">
                                <h2 className="text-3xl font-extrabold text-gray-900">Meet Our Team</h2>
                                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                                    Passionate educators and technologists working together to revolutionize learning
                                </p>
                            </div>

                            <div className="mt-16 lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">Our Story</h3>
                                    <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                                        LabX was born from the recognition that traditional laboratory education faces significant challenges: limited access to expensive equipment, safety concerns, and geographical constraints. Our team of educators, engineers, and developers came together to create a solution that would democratize laboratory education.
                                    </p>
                                    <p className="mt-4 text-lg text-gray-600 leading-relaxed">
                                        Through years of research and development, we've created a platform that not only simulates real laboratory conditions but enhances them with capabilities impossible in physical labs.
                                    </p>
                                </div>
                                <div className="mt-12 lg:mt-0">
                                    {/* Placeholder for team photo/video */}
                                    <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg h-64 lg:h-80 flex items-center justify-center shadow-lg">
                                        <div className="text-center">
                                            <svg className="mx-auto h-16 w-16 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                            <p className="mt-4 text-indigo-600 font-medium">Team Introduction</p>
                                            <p className="text-sm text-indigo-500">Photo/Video Coming Soon</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Values Section */}
                    <div className="py-16 sm:py-20 bg-gray-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center">
                                <h2 className="text-3xl font-extrabold text-gray-900">Our Values</h2>
                            </div>

                            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                <div className="text-center">
                                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-6 text-lg font-semibold text-gray-900">Accessibility</h3>
                                    <p className="mt-4 text-gray-600">Making quality education available to everyone, everywhere</p>
                                </div>

                                <div className="text-center">
                                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-6 text-lg font-semibold text-gray-900">Safety</h3>
                                    <p className="mt-4 text-gray-600">Providing risk-free learning environments for all experiments</p>
                                </div>

                                <div className="text-center">
                                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-6 text-lg font-semibold text-gray-900">Innovation</h3>
                                    <p className="mt-4 text-gray-600">Continuously pushing the boundaries of educational technology</p>
                                </div>

                                <div className="text-center">
                                    <div className="mx-auto h-16 w-16 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="mt-6 text-lg font-semibold text-gray-900">Excellence</h3>
                                    <p className="mt-4 text-gray-600">Delivering the highest quality educational experiences</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-indigo-600">
                        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
                            <div className="text-center">
                                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                                    Ready to Transform Education?
                                </h2>
                                <p className="mt-4 text-xl text-indigo-200">
                                    Join thousands of educators and students already using LabX
                                </p>
                                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                                    <Link to="/signup" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors shadow-lg">
                                        Get Started Today
                                    </Link>
                                    <Link to="/features" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition-colors">
                                        Explore Features
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
        </>
    );
};

export default About;