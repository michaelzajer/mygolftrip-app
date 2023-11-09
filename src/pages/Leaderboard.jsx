import React from 'react';

export default function Leaderboard() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {/* Golf Icon or Illustration */}
      <img
            src="/golfball.svg.svg"
            alt="Golf Ball Logo"
            className="max-w-full h-auto md:max-w-md cursor-pointer mx-auto" // Ensure the image remains centered with `mx-auto`
          />

      {/* Under Construction Message */}
      <h1 className="text-2xl font-bold text-green-200 mt-4">
        Leaderboard Under Construction
      </h1>

      {/* Golfing Metaphor */}
      <p className="text-center mt-2 text-gray-900">
        We're still on the front nine. Check back soon as we perfect our leaderboard's swing!
      </p>

      {/* Progress Indicator - Just a Fun Representation */}
      <div className="w-full max-w-xs mt-6">
        <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
          <div className="bg-green-300 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-l-full" style={{ width: '50%' }}>Hole 9 of 18</div>
        </div>
      </div>
    </div>
  );
}
