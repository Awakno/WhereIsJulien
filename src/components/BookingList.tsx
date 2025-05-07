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
      <p className="text-gray-500">Chargement…</p>
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
