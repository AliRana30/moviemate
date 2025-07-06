import React from 'react';
import { dummyBookingData } from '../../assets/assets';

const ListBookings = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">All Bookings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-red-600 text-white">
              <th className="text-left px-4 py-2 border-r">Username</th>
              <th className="text-left px-4 py-2 border-r">Movie Name</th>
              <th className="text-left px-4 py-2 border-r">Show Time</th>
              <th className="text-left px-4 py-2 border-r">Seats</th>
              <th className="text-left px-4 py-2">Amount ($)</th>
            </tr>
          </thead>
          <tbody>
            {dummyBookingData.map((booking, index) => (
              <tr key={index} className="border-b hover:bg-red-400 cursor-pointer">
                <td className="px-4 py-2">{booking.user.name}</td>
                <td className="px-4 py-2">{booking.show.movie.title}</td>
                <td className="px-4 py-2">
                  {new Date(booking.show.showDateTime).toLocaleString()}
                </td>
                <td className="px-4 py-2">{booking.bookedSeats.join(', ')}</td>
                <td className="px-4 py-2">${booking.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListBookings;
