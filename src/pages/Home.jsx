import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-bground-100">
      <div className="mt-2 self-stretch">
        <Link to="/sign-in">
          {/* Increase the max-w class for a larger maximum width */}
          {/* For example, use md:max-w-2xl for a maximum width of 2xl at medium breakpoint */}
          {/* You can use lg:max-w-2xl for a larger breakpoint if needed */}
          <img
            src="/mygolftrip_logo4.svg"
            alt="My Golf Trip Logo"
            className="max-w-full h-auto md:max-w-2xl cursor-pointer mx-auto bg-blue-100"
          />
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
    </div>
  );
}