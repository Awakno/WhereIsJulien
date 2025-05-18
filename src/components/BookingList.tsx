import React from "react";
import BookingListItem from "./BookingListItem";
import { BookingListProps } from "@/types/booking";
import LoadingCircle from "./LoadingCircle";

const BookingList: React.FC<BookingListProps> = ({
  bookings,
  isLoading,
  onDelete,
  onEdit,
  onRefund,
  error,
  NoSession,
}) => (
  <section className="card-apple w-full max-w-2xl mx-auto px-2 sm:px-6 py-4 sm:py-6 rounded-lg shadow-md bg-white/5 backdrop-blur-md border border-white/10">
    <h2 className="text-lg xs:text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-white">
      Remplacements enregistrés
    </h2>
    {isLoading && bookings.length === 0 && (
      <LoadingCircle text="Chargement..." />
    )}
    {!isLoading && bookings.length === 0 && !error && (
      <p className="text-gray-400 text-xs sm:text-base">
        Aucun remplacement récent à afficher.
      </p>
    )}
    {bookings.length > 0 && (
      <ul className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 sm:pr-2">
        {bookings.map((booking) => (
          <BookingListItem
            key={booking._id || `${booking.date}-${booking.meal}`}
            booking={booking}
            onDelete={onDelete}
            onEdit={onEdit}
            onRefund={onRefund}
            isLoading={isLoading}
            NoSession={NoSession}
          />
        ))}
      </ul>
    )}
  </section>
);

export default BookingList;
