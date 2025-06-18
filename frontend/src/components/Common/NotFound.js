import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold text-blue-600 dark:text-blue-400 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Page Not Found</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">Sorry, the page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-semibold">
          Go Dashboard
        </Link>
      </div>
      <div className="mt-10">
        <img src={require('../../assets/images/notfound.svg').default} alt="Not Found" className="w-80 mx-auto opacity-80" />
      </div>
    </div>
  );
};

export default NotFound;
