import { BookingListItemProps } from "@/types/booking";
import React from "react";

const BookingListItem: React.FC<BookingListItemProps> = ({
  booking,
  onDelete,
  onEdit,
  onRefund,
  isLoading,
  NoSession,
}) => (
  <li
    className={`card-apple p-3 xs:p-4 flex flex-col gap-3 xs:gap-4 ${
      booking.remboursee ? "opacity-80" : ""
    }`}
    style={{
      boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
      border: "1px solid #d1d1d6",
      background: booking.remboursee ? "#d1fae5" : "#e5e5e5", // Green for refunded, gray otherwise
      minHeight: 0,
    }}
  >
    <div className="flex flex-col">
      <h3
        className="text-sm xs:text-base font-semibold truncate"
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
        <span
          className={
            booking.remboursee
              ? "bg-green-400 badge-apple ml-2"
              : "bg-red-400 badge-apple ml-2"
          }
        >
          {booking.remboursee ? "Remboursé" : "Non remboursé"}
        </span>
      </h3>
      <p
        className="text-gray-600 mt-1 text-xs xs:text-sm break-words"
        style={{ wordBreak: "break-word" }}
      >
        {booking.reason}
      </p>
    </div>
    <div className="flex flex-row flex-wrap justify-center gap-2 mt-2 xs:mt-4">
      {!booking.remboursee && !NoSession && (
        <>
          <button
            onClick={() => onRefund(booking.date, booking.meal)}
            onTouchStart={() => onRefund(booking.date, booking.meal)}
            disabled={isLoading}
            className="text-xs bg-gray-800 text-white rounded px-3 xs:px-4 py-2 hover:bg-gray-700 transition-colors duration-200"
            style={{ minWidth: 90 }}
          >
            Marquer remboursé
          </button>
        </>
      )}
      {!NoSession && (
        <button
          onClick={() => onEdit(booking)}
          onTouchStart={() => onEdit(booking)}
          disabled={isLoading}
          className="text-xs bg-gray-800 text-white rounded px-3 xs:px-4 py-2 hover:bg-gray-700 transition-colors duration-200"
          style={{ minWidth: 90 }}
        >
          Modifier
        </button>
      )}
      {!NoSession && (
        <button
          onClick={() => onDelete(booking.date, booking.meal, booking.reason)}
          onTouchStart={() =>
            onDelete(booking.date, booking.meal, booking.reason)
          }
          disabled={isLoading}
          className="text-xs bg-gray-800 text-red rounded px-3 xs:px-4 py-2 hover:bg-gray-700 transition-colors duration-200"
        >
          Supprimer
        </button>
      )}
    </div>
  </li>
);

export default BookingListItem;
