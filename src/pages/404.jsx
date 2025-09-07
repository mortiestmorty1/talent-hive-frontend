import React from 'react';
import { useRouter } from 'next/router';
import { FaExclamationTriangle, FaHome, FaArrowLeft } from 'react-icons/fa';

const Custom404 = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <FaExclamationTriangle className="mx-auto text-6xl text-yellow-500 mb-4" />
          <h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Page Not Found</h2>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-lg text-gray-500 mb-4">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-gray-400">
            It might have been removed, renamed, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.back()}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FaArrowLeft />
            Go Back
          </button>
          
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FaHome />
            Back to Home
          </button>
        </div>

        {/* Help Links */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <button
              onClick={() => router.push('/jobs/browse')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Browse Jobs
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Profile
            </button>
            <button
              onClick={() => router.push('/orders')}
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Custom404;
