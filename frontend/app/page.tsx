'use client';

import { Navbar } from '../src/components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to FestivalNFT
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Buy, sell, and manage festival tickets securely using blockchain technology.
          </p>
          <div className="mt-10 flex justify-center gap-x-6">
            <Link
              href="/create-festival"
              className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Create Festival
            </Link>
            <Link
              href="/primary-market"
              className="rounded-md bg-blue-100 px-6 py-3 text-lg font-semibold text-blue-900 shadow-sm hover:bg-blue-200"
            >
              Buy Tickets
            </Link>
          </div>
        </div>

        <div className="mt-32 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Festivals</h2>
            <p className="text-gray-600">
              Organize and manage your festivals with ease. Set ticket prices, quantities, and more.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Primary Market</h2>
            <p className="text-gray-600">
              Purchase tickets directly from festival organizers at official prices.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Secondary Market</h2>
            <p className="text-gray-600">
              Resell or buy tickets from other users in a secure and transparent way.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
} 