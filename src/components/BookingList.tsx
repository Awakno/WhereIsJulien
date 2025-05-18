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
}) => (
  <section className="card-apple">
    <h2 className="text-2xl font-semibold mb-6" style={{ color: "#fffff" }}>
      Remplacements enregistrés
    </h2>
    {isLoading && bookings.length === 0 && (
      <LoadingCircle text="Chargement..."/>
    )}
    {!isLoading && bookings.length === 0 && !error && (
      <p className="text-gray-500">Aucun remplacement récent à afficher.</p>
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
