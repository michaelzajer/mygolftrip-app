import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      {/* Adjust the margin top of the logo container to push the logo up */}
      {/* Note that `mt-8` is a Tailwind CSS class that applies margin-top of 2rem (32px) */}
      {/* You can adjust the mt-{size} to increase or decrease the space */}
      <div className="mt-2 self-stretch">
        {/* Wrap the image with a Link from react-router-dom */}
        <Link to="/sign-in">
          <img
            src="/mygolftrip_logo.png"
            alt="My Golf Trip Logo"
            className="max-w-full h-auto md:max-w-md cursor-pointer mx-auto" // Ensure the image remains centered with `mx-auto`
          />
        </Link>
      </div>
      {/* Centered text under the logo */}
      <p className="text-center mt-4">
        Don't have an account?
        <Link to="/sign-up"
          className="text-green-300 hover:text-blue-500 transition duration-200 ease-in-out ml-1"
        >
          Register
        </Link>
      </p>
    </div>
  );
}
