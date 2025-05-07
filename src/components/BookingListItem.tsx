import React from "react";

interface Booking {
  _id?: string;
  date: string;
  meal: "lunch" | "dinner";
  reason: string;
  remboursee?: boolean;
}

interface BookingListItemProps {
  booking: Booking;
  onDelete: (date: string, meal: "lunch" | "dinner", reason: string) => void;
  onEdit: (booking: Booking) => void;
  onRefund: (date: string, meal: "lunch" | "dinner") => void;
  isLoading: boolean;
}

const BookingListItem: React.FC<BookingListItemProps> = ({
  booking,
  onDelete,
  onEdit,
  onRefund,
  isLoading,
}) => (
  <li
    className={`card-apple p-4 flex flex-col gap-4 ${
      booking.remboursee ? "opacity-80" : ""
    }`}
    style={{
      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
      border: "1px solid #d1d1d6",
      background: "#e5e5e5", // Changed to a light gray background
      minHeight: 0,
    }}
  >
    <div className="flex flex-col">
      <h3
        className="text-base font-semibold truncate"
        style={{ color: "#000" }}
      >
        {new Date(booking.date).toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        })}{" "}
        {" - "}
        {booking.meal === "lunch" ? "Déjeuner" : "Dîner"}
        {booking.remboursee && (
          <span className="badge-apple ml-2">Remboursé</span>
        )}
      </h3>
      <p
        className="text-gray-600 mt-1 text-sm break-words"
        style={{ wordBreak: "break-word" }}
      >
        {booking.reason}
      </p>
    </div>
    <div className="flex flex-row justify-center gap-2 mt-4">
      {!booking.remboursee && (
        <button
          onClick={() => onRefund(booking.date, booking.meal)}
          disabled={isLoading}
          className="text-xs bg-gray-800 text-white rounded px-4 py-2 hover:bg-gray-700 transition-colors duration-200"
          style={{ minWidth: 110 }}
        >
          Marquer remboursé
        </button>
      )}
      <button
        onClick={() => onEdit(booking)}
        disabled={isLoading}
        className="text-xs bg-gray-800 text-white rounded px-4 py-2 hover:bg-gray-700 transition-colors duration-200"
        style={{ minWidth: 110 }}
      >
        Modifier
      </button>
      <button
        onClick={() => onDelete(booking.date, booking.meal, booking.reason)}
        disabled={isLoading}
        className="text-xs bg-gray-800 text-red rounded px-4 py-2 hover:bg-gray-700 transition-colors duration-200"
        
      >
        Supprimer
      </button>
    </div>
  </li>
);

export default BookingListItem;
