/*
This page is called from ./pages/Home.jsx as a link
*/

import React from 'react';

export default function About() {
  return (
    <div className="bg-bground-100 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">Welcome to My Golf Trip</h1>
        
        <section className="mb-6">
          <h2 className="text-3xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg">
            At My Golf Trip, our mission is to revolutionize your golf trip experience. We provide an intuitive, all-in-one platform for organizing and enjoying golf trips with friends, combining convenience with competition.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-3xl font-semibold mb-4">How It Works</h2>
          <ol className="list-decimal list-inside text-lg">
            <li>Set Up as an admin and create your own golf trip.</li>
            <li>Invite friends to join your trip.</li>
            <li>Customize dates, courses, and competition formats.</li>
            <li>Enjoy the game with live scoring and a dynamic leaderboard.</li>
          </ol>
        </section>

        <section className="mb-6">
          <h2 className="text-3xl font-semibold mb-4">Why Choose Us</h2>
          <ul className="list-disc list-inside text-lg">
            <li>User-Friendly Interface</li>
            <li>Flexible and Customizable</li>
            <li>Connect and Compete with friends</li>
            <li>Reliable Scoring System</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-3xl font-semibold mb-4">Testimonials</h2>
          <p className="text-lg italic">"My Golf Trip has transformed the way we plan and enjoy our golf outings. The seamless experience and live leaderboard feature are game-changers!" - A satisfied user</p>
          {/* Include more testimonials here */}
        </section>

        <section>
          <p className="text-lg mb-4">
            Join our community of golf enthusiasts and start experiencing the best of golf trips tailored just for you and your friends. It's not just about playing golf; it's about creating lasting memories on the course.
          </p>
          <div className="text-center">
            <a href="/sign-up" className="text-blue-100 hover:text-pink-100 transition duration-200 ease-in-out">
              Join Our Community Today!
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}