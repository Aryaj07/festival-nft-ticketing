'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { Navbar } from '../../src/components/Navbar';
import { useNFTContract } from '../../src/hooks/useNFTContract';
import { toast } from 'react-hot-toast';

export default function CreateFestival() {
  const { address } = useAccount();
  const { createFestival, isCreatingFestival, hasMinterRole } = useNFTContract();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    ticketPrice: '',
    totalTickets: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!hasMinterRole) {
      toast.error('You do not have the MINTER_ROLE required to create festivals');
      return;
    }
    
    try {
      console.log('Creating festival:', formData);
      
      // Convert date to Unix timestamp
      const dateTimestamp = Math.floor(new Date(formData.date).getTime() / 1000);
      
      // Convert ticket price to Wei
      const ticketPriceWei = parseEther(formData.ticketPrice);
      
      await createFestival({
        args: [
          formData.name,
          formData.description,
          BigInt(dateTimestamp),
          formData.venue,
          ticketPriceWei,
          BigInt(formData.totalTickets)
        ]
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        date: '',
        venue: '',
        ticketPrice: '',
        totalTickets: '',
      });
    } catch (error) {
      console.error('Error creating festival:', error);
      toast.error('Failed to create festival');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-lg">
            Please connect your wallet to create a festival.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Festival</h1>
            <p className="mt-2 text-gray-600">Fill in the details below to create a new festival.</p>
          </div>
          
          {!hasMinterRole && address && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-yellow-700">
                    You do not have the MINTER_ROLE required to create festivals. Please contact the contract admin to grant you this role.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Festival Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter festival name"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow duration-200 placeholder:text-gray-500"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    placeholder="Enter festival description"
                    rows={3}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow duration-200 placeholder:text-gray-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow duration-200 text-gray-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
                      Venue
                    </label>
                    <input
                      type="text"
                      id="venue"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      required
                      placeholder="Enter venue location"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow duration-200 placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700">
                      Ticket Price (ETH)
                    </label>
                    <div className="mt-1 relative rounded-lg shadow-sm">
                      <input
                        type="number"
                        id="ticketPrice"
                        name="ticketPrice"
                        value={formData.ticketPrice}
                        onChange={handleChange}
                        required
                        step="0.001"
                        min="0"
                        placeholder="0.00"
                        className="block w-full rounded-lg border-gray-300 pl-3 pr-12 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow duration-200 placeholder:text-gray-500"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">ETH</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="totalTickets" className="block text-sm font-medium text-gray-700">
                      Total Tickets
                    </label>
                    <input
                      type="number"
                      id="totalTickets"
                      name="totalTickets"
                      value={formData.totalTickets}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="Enter total number of tickets"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow duration-200 placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 sm:px-8">
              <button
                type="submit"
                disabled={!hasMinterRole || isCreatingFestival}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isCreatingFestival ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Festival...</span>
                  </div>
                ) : (
                  'Create Festival'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
} 