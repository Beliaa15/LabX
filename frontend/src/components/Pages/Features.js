import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { VideoPlayer } from './VideoPlayer';

  // Create Unity HTML content with relative paths to avoid CORS issues
  const createUnityHTML = (taskTitle) => {
    return `
<!DOCTYPE html>
<html lang="en-us">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Unity Web Player | ${taskTitle}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #1a1a1a;
            font-family: Arial, sans-serif;
            overflow: hidden;
        }
        
        #unity-container {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
        }
        
        #unity-canvas {
            background: #231F20;
            width: 95% !important;
            height: 90% !important;
            max-width: none;
            max-height: none;
            min-width: 800px;
            min-height: 600px;
        }
        
        #unity-loading-bar {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 20px 0;
            position: absolute;
            z-index: 10;
        }
        
        #unity-progress-bar-empty {
            width: 200px;
            height: 18px;
            margin: 10px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 9px;
        }
        
        #unity-progress-bar-full {
            width: 0%;
            height: 18px;
            background: linear-gradient(90deg, #ff6b35, #f7931e);
            border-radius: 9px;
            transition: width 0.3s ease;
        }
        
        #unity-warning {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
        }
        
        #unity-footer {
            position: absolute;
            bottom: 10px;
            right: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 100;
        }
        
        #unity-fullscreen-button {
            width: 38px;
            height: 38px;
            background: rgba(255, 255, 255, 0.8);
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            user-select: none;
        }
        
        #unity-fullscreen-button:hover {
            background: rgba(255, 255, 255, 1);
        }
        
        #unity-build-title {
            color: white;
            font-size: 16px;
            font-weight: bold;
        }
        
        .loading-text {
            color: white;
            margin-top: 10px;
            font-size: 14px;
        }
        
        .error-message {
            color: #ff6b6b;
            background: rgba(255, 107, 107, 0.1);
            padding: 15px;
            border-radius: 5px;
            margin: 20px;
            text-align: center;
        }

        /* Responsive adjustments */
        @media (max-width: 1200px) {
            #unity-canvas {
                width: 90% !important;
                height: 85% !important;
                min-width: 600px;
                min-height: 450px;
            }
        }

        @media (max-width: 768px) {
            #unity-canvas {
                width: 98% !important;
                height: 80% !important;
                min-width: 320px;
                min-height: 240px;
            }
            
            #unity-footer {
                bottom: 5px;
                right: 5px;
            }
        }
</style>
</head>
<body>
    <div id="unity-container">
        <canvas id="unity-canvas" width="960" height="600" tabindex="-1"></canvas>
        <div id="unity-loading-bar">
            <div id="unity-logo"></div>
            <div id="unity-progress-bar-empty">
                <div id="unity-progress-bar-full"></div>
            </div>
            <div class="loading-text">Loading Demo...</div>
        </div>
        <div id="unity-warning"></div>
        <div id="unity-footer">
            <div id="unity-fullscreen-button">⛶</div>
        </div>
    </div>
    
    <script>
        var canvas = document.querySelector("#unity-canvas");
        
        // Communication with parent window
        function notifyParent(type, data) {
            try {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: type, data: data }, '*');
                    console.log('Sent message to parent:', type, data);
                }
            } catch (e) {
                console.warn('Failed to send message to parent:', e);
            }
        }
        
        // Task completion handler
        window.unityTaskCompleted = function(data) {
            console.log('Task completed:', data);
            notifyParent('TaskCompleted', data);
        };

        function unityShowBanner(msg, type) {
            var warningBanner = document.querySelector("#unity-warning");
            function updateBannerVisibility() {
                warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
            }
            var div = document.createElement('div');
            div.innerHTML = msg;
            warningBanner.appendChild(div);
            if (type == 'error') div.style = 'background: red; padding: 10px; color: white;';
            else {
                if (type == 'warning') div.style = 'background: yellow; padding: 10px; color: black;';
                setTimeout(function() {
                    warningBanner.removeChild(div);
                    updateBannerVisibility();
                }, 5000);
            }
            updateBannerVisibility();
        }        // Use the current window location for WebGL assets
        var baseUrl = process.env.NODE_ENV === 'production' 
            ? "/webgl/68521f8c8686b74a5725ea0b"
            : "http://localhost:3000/webgl/68521f8c8686b74a5725ea0b";
        var buildUrl = baseUrl + "/Build";
        var loaderUrl = buildUrl + "/build.loader.js";
        
        console.log('Loading Unity from:', baseUrl);
        console.log('Loader URL:', loaderUrl);
        
        var config = {
            arguments: [],
            dataUrl: buildUrl + "/build.data",
            frameworkUrl: buildUrl + "/build.framework.js",
            codeUrl: buildUrl + "/build.wasm",
            streamingAssetsUrl: baseUrl + "/StreamingAssets",
            companyName: "DefaultCompany",
            productName: "Demo",
            productVersion: "1.0",
            showBanner: unityShowBanner,
        };

        // Responsive canvas sizing
        function resizeCanvas() {
            try {
                var container = document.querySelector("#unity-container");
                var containerRect = container.getBoundingClientRect();
                var aspectRatio = 1920 / 1080; // Original aspect ratio
                
                var maxWidth = containerRect.width * 0.9;
                var maxHeight = containerRect.height * 0.8;
                
                var width, height;
                
                if (maxWidth / aspectRatio <= maxHeight) {
                    width = maxWidth;
                    height = maxWidth / aspectRatio;
                } else {
                    height = maxHeight;
                    width = maxHeight * aspectRatio;
                }
                
                canvas.style.width = width + "px";
                canvas.style.height = height + "px";
            } catch (e) {
                console.warn('Error resizing canvas:', e);
            }
        }

        // Mobile detection
        if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
            var meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
            document.getElementsByTagName('head')[0].appendChild(meta);
            
            // Mobile specific styling
            document.querySelector("#unity-container").style.padding = "10px";
            canvas.style.maxWidth = "100%";
            canvas.style.maxHeight = "70vh";
        } else {
            // Desktop sizing
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
        }

        document.querySelector("#unity-loading-bar").style.display = "block";

        // Load Unity with error handling
        function loadUnity() {
            var script = document.createElement("script");
            script.src = loaderUrl;
            script.crossOrigin = "anonymous"; // Add crossOrigin attribute
            
            script.onload = function() {
                console.log('Unity loader script loaded successfully');
                
                if (typeof createUnityInstance === 'undefined') {
                    console.error('createUnityInstance is not defined');
                    unityShowBanner('Unity loader did not define createUnityInstance function', 'error');
                    return;
                }
                
                createUnityInstance(canvas, config, function(progress) {
                    document.querySelector("#unity-progress-bar-full").style.width = 100 * progress + "%";
                }).then(function(unityInstance) {
                    document.querySelector("#unity-loading-bar").style.display = "none";
                    
                    // Fullscreen button
                    document.querySelector("#unity-fullscreen-button").onclick = function() {
                        unityInstance.SetFullscreen(1);
                    };
                    
                    // Notify parent that game has loaded
                    notifyParent('GameLoaded', true);
                    
                    console.log('Unity instance created successfully');
                    
                }).catch(function(message) {
                    console.error('Unity loading error:', message);
                    unityShowBanner('Failed to load Unity: ' + message, 'error');
                    document.querySelector("#unity-loading-bar").style.display = "none";
                });
            };
            
            script.onerror = function() {
                console.error('Failed to load Unity loader script from:', loaderUrl);
                unityShowBanner('Failed to load Unity loader script. The game files may not exist at the expected location.', 'error');
                document.querySelector("#unity-loading-bar").style.display = "none";
            };

            document.body.appendChild(script);
        }
        
        // Start loading Unity
        loadUnity();
        
        // Test communication with parent
        setTimeout(function() {
            notifyParent('IframeReady', { title: 'Demo' });
        }, 1000);
    </script>
</body>
</html>`;
  };


/**
 * Features page component for LabX Educational Platform
 * @returns {React.ReactNode} - The features page component
 */
const Features = () => {
    const { isAuthenticated } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <Helmet>
                <title>Features - LabX Virtual Laboratory Platform | 3D Interactive Learning</title>
                <meta name="description" content="Explore LabX features: 3D interactive laboratories, course management, real-time collaboration, secure authentication, and comprehensive progress tracking." />
                <meta name="keywords" content="LabX features, 3D laboratory, virtual experiments, course management, interactive learning, educational technology" />
                <meta property="og:title" content="LabX Features - 3D Interactive Learning Platform" />
                <meta property="og:description" content="Discover powerful features: 3D virtual labs, course management, real-time collaboration, and secure learning environment." />
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

                    {/* 3D Labs Showcase with Video */}
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
                                    {/* 3D Lab Demo Video */}
                                    <VideoPlayer
                                        src="/videos/demos/3d-lab-demo.mp4"
                                        poster="/videos/demos/3d-lab-demo-poster.jpg"
                                        title="3D Virtual Laboratory Demo"
                                        className="h-64 lg:h-80"
                                        onPlay={() => console.log('3D Lab demo started')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* EECircuit Engine with Video */}
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
                                    {/* Circuit simulation demo using Unity iframe */}
                                    <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg h-64 lg:h-80 shadow-lg overflow-hidden relative">
                                        <iframe
                                            srcDoc={createUnityHTML("Demo")}
                                            className="w-full h-full border-0"
                                            title="Circuit Simulation Demo - EECircuit Engine"
                                            allowFullScreen
                                            allow="fullscreen"
                                            style={{ background: 'transparent' }}
                                            onLoad={() => console.log('Circuit demo iframe loaded')}
                                            onError={() => console.error('Circuit demo iframe failed to load')}
                                        />
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

                    {/* Enhanced Demo Section with Multiple Videos */}
                    <div className="py-16 sm:py-20 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="text-center">
                                <h2 className="text-3xl font-extrabold text-gray-900">See LabX in Action</h2>
                                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                                    Watch our comprehensive demos showcasing the power of virtual laboratories
                                </p>
                            </div>

                            <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Electronics Lab Demo Video */}
                                <div className="space-y-4">
                                    <VideoPlayer
                                        src="/videos/demos/electronics-lab-demo.mp4"
                                        poster="/videos/demos/electronics-lab-demo-poster.jpg"
                                        title="Electronics Lab Demo - EECircuit Engine"
                                        className="h-64 lg:h-80"
                                        onPlay={() => console.log('Electronics demo started')}
                                    />
                                    <div className="text-center lg:text-left">
                                        <h3 className="text-xl font-semibold text-gray-900">Electronics Laboratory</h3>
                                        <p className="mt-2 text-gray-600">Build circuits, analyze waveforms, and test electronic components with our advanced simulation engine.</p>
                                        <div className="mt-4 flex flex-wrap gap-2 justify-center lg:justify-start">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Circuit Design
                                            </span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                Waveform Analysis
                                            </span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                Real-time Simulation
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 3D Lab Demo Video */}
                                <div className="space-y-4">
                                    <VideoPlayer
                                        src="/videos/demos/3d-lab-demo.mp4"
                                        poster="/videos/demos/3d-lab-demo-poster.jpg"
                                        title="3D Virtual Laboratory Demo"
                                        className="h-64 lg:h-80"
                                        onPlay={() => console.log('3D Lab demo started')}
                                    />
                                    <div className="text-center lg:text-left">
                                        <h3 className="text-xl font-semibold text-gray-900">3D Virtual Laboratories</h3>
                                        <p className="mt-2 text-gray-600">Experience immersive 3D environments with realistic physics and interactive equipment.</p>
                                        <div className="mt-4 flex flex-wrap gap-2 justify-center lg:justify-start">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                3D Physics
                                            </span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Interactive Equipment
                                            </span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                Collaborative Learning
                                            </span>
                                        </div>
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
        </>
    );
};

export default Features;