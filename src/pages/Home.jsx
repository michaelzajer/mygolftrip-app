//Home Page
import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-bground-100 p-4">
      <div className="self-stretch">
        <Link to="/sign-in">
          <img
            src="/mygolftrip_logo4.svg"
            alt="My Golf Trip Logo"
            className="max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl mx-auto bg-blue-100"
          />
        </Link>
      </div>

      <div className="text-center mt-8">
        <h1 className="text-3xl font-bold mb-2">Craft Your Ultimate Golf Trip Experience!</h1>
        <p className="mb-4">Your One-Stop Solution for Personalized Golf Trip Competitions.</p>
        <ul className="text-left list-disc list-inside mb-4">
          <li>Golfer Admin Setup</li>
          <li>Add Friends</li>
          <li>Customize Dates</li>
          <li>Group Competitions</li>
          <li>Live Leaderboard</li>
          <li>Scorecards & Tees</li>
          <li>Accurate Scoring</li>
        </ul>
        <Link to="/sign-up" className="bg-blue-100 hover:bg-blue-200 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          Start Planning Your Golf Trip Today!
        </Link>
      </div>
      <p className="text-center mt-4">
        Don't have an account?
        <Link to="/sign-up"
          className="text-blue-100 hover:text-pink-100 transition duration-200 ease-in-out ml-1"
        >
          Register
        </Link>
      </p>
      <p className="text-center mt-4">
      <Link to="/about"
          className="text-blue-100 hover:text-pink-100 transition duration-200 ease-in-out ml-1"
        >
          About
        </Link>
        </p>
      
    </div>
  );
}