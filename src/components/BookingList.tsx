import React from "react";
import BookingListItem from "./BookingListItem";

interface Booking {
  _id?: string;
  date: string;
  meal: "lunch" | "dinner";
  reason: string;
  remboursee?: boolean;
}

interface BookingListProps {
  bookings: Booking[];
  isLoading: boolean;
  onDelete: (date: string, meal: "lunch" | "dinner", reason: string) => void;
  onEdit: (booking: Booking) => void;
  onRefund: (date: string, meal: "lunch" | "dinner") => void;
  error: string | null;
}

const BookingList: React.FC<BookingListProps> = ({
  bookings,
  isLoading,
  onDelete,
  onEdit,
  onRefund,
  error,
}) => (
  <section className="card-apple">
    <h2 className="text-2xl font-semibold mb-6" style={{ color: "#fffff" }}>
      Remplacements enregistrés
    </h2>
    {isLoading && bookings.length === 0 && (
      <div className="flex justify-center items-center py-8">
        <svg
          className="animate-spin h-6 w-6 text-gray-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <span className="ml-2 text-gray-500">Chargement…</span>
      </div>
    )}
    {!isLoading && bookings.length === 0 && !error && (
      <p className="text-gray-500">Aucun remplacement à afficher.</p>
    )}
    {bookings.length > 0 && (
      <ul className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {bookings.map((booking) => (
          <BookingListItem
            key={booking._id || `${booking.date}-${booking.meal}`}
            booking={booking}
            onDelete={onDelete}
            onEdit={onEdit}
            onRefund={onRefund}
            isLoading={isLoading}
          />
        ))}
      </ul>
    )}
  </section>
);

export default BookingList;
