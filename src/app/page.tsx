"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import BookingForm from "../components/BookingForm";
import BookingList from "../components/BookingList";
import ErrorAlert from "../components/ErrorAlert";
import { Booking } from "@/types/booking";

export default function Home() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [date, setDate] = useState("");
  const [meal, setMeal] = useState<"lunch" | "dinner">("lunch");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [stats, setStats] = useState<{
    actives: number;
    remboursee: number;
  } | null>(null);

  const API_URL = "/api/book";
  bookings.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA.getTime() - dateB.getTime();
  });
  // sort by isRemboursee
  bookings.sort((a, b) => {
    if (a.remboursee === b.remboursee) return 0;
    return a.remboursee ? 1 : -1;
  });

  // if refund date > 7 days, remove from view
  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  // Filter out bookings that are refunded and older than 7 days
  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date);
    // Keep if not refunded, or if refunded but within last 7 days
    return !booking.remboursee || bookingDate >= sevenDaysAgo;
  });

  // Fetch bookings
  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch bookings");
      }
      const data = await response.json();
      setBookings(data.bookings || []);
      setStats(
        data.stats
          ? { actives: data.stats.actives, remboursee: data.stats.remboursee }
          : null
      );
    } catch (err: any) {
      setError(err.message);
      setBookings([]); // Clear bookings on error
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Handle form submission (create or update)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const bookingData = { date, meal, reason };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save booking");
      }
      await response.json(); // Consume the response body
      fetchBookings(); // Refresh bookings list
      setDate("");
      setMeal("lunch");
      setReason("");
      setEditingBooking(null); // Reset editing state
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle booking deletion
  const handleDelete = async (
    bookingDate: string,
    bookingMeal: "lunch" | "dinner",
    reason: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: bookingDate,
          meal: bookingMeal,
        }), // Only send date and meal
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete booking");
      }
      await response.json(); // Consume the response body
      fetchBookings(); // Refresh bookings list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refund
  const handleRefund = async (
    bookingDate: string,
    bookingMeal: "lunch" | "dinner"
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: bookingDate, meal: bookingMeal }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erreur lors du remboursement");
      }
      await response.json();
      fetchBookings();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Populate form for editing
  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setDate(booking.date.split("T")[0]); // Format date for input type="date"
    setMeal(booking.meal);
    setReason(booking.reason);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-2 sm:p-4 md:p-8 font-sans"
      style={{ background: "#111216" }}
    >
      <header className="mb-8 sm:mb-10 text-center">
        <h1
          className="text-3xl sm:text-5xl font-bold"
          style={{ color: "#fff", letterSpacing: "0.01em" }}
        >
          Qui doit mettre la table ?
        </h1>
        <p className="mt-2 text-base sm:text-xl" style={{ color: "#fff" }}>
          Note ici chaque fois que tu remplaces ton frère pour mettre la table.
          <br />
          Quand il t'aura remboursé (en mettant la table à ta place), marque-le
          comme remboursé !
        </p>
        <div className="flex justify-center mt-6 gap-2">
          <a href="/stats" className="btn-apple text-sm sm:text-base">
            Statistiques de remplacement
          </a>
          <a href="/history" className="btn-apple text-sm sm:text-base">
            Historique des remplacements
          </a>
          {session || process.env.NEXT_PUBLIC_DEVELOPMENT ? (
            <button
              onClick={() => signOut()}
              className="btn-apple text-sm sm:text-base"
            >
              Se déconnecter ({session?.user?.email || "DEVMODE (ADMIN)"})
            </button>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="btn-apple text-sm sm:text-base"
            >
              Se connecter avec GitHub
            </button>
          )}
        </div>
      </header>
      <ErrorAlert error={error} />
      {stats && (
        <div className="mb-4 sm:mb-6 w-full max-w-4xl flex flex-col md:flex-row gap-2 sm:gap-4 justify-center items-center">
          <div className="card-apple px-4 py-2 text-base sm:text-lg font-semibold text-center flex-1">
            Remplacements en attente :{" "}
            <span className="bg-[#e5e5ea] badge-apple">{stats.actives}</span>
          </div>
          <div className="card-apple px-4 py-2 text-base sm:text-lg font-semibold text-center flex-1">
            Remboursés (table mise par ton frère) :{" "}
            <span className="bg-[#e5e5ea] badge-apple">{stats.remboursee}</span>
          </div>
        </div>
      )}
      <main
        className={
          session || process.env.NEXT_PUBLIC_DEVELOPMENT
            ? "w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8"
            : "w-full max-w-4xl flex flex-col gap-4 sm:gap-8"
        }
      >
        {(!!session || process.env.NEXT_PUBLIC_DEVELOPMENT) && (
          <BookingForm
            date={date}
            meal={meal}
            reason={reason}
            isLoading={isLoading}
            editingBooking={editingBooking}
            onDateChange={setDate}
            onMealChange={setMeal}
            onReasonChange={setReason}
            onSubmit={handleSubmit}
            onCancelEdit={() => {
              setEditingBooking(null);
              setDate("");
              setMeal("lunch");
              setReason("");
            }}
          />
        )}
        <BookingList
          bookings={filteredBookings}
          isLoading={isLoading}
          NoSession={session ? false : true}
          onDelete={
            session || process.env.NEXT_PUBLIC_DEVELOPMENT
              ? handleDelete
              : () => {}
          }
          onEdit={
            session || process.env.NEXT_PUBLIC_DEVELOPMENT
              ? handleEdit
              : () => {}
          }
          onRefund={
            session || process.env.NEXT_PUBLIC_DEVELOPMENT
              ? handleRefund
              : () => {}
          }
          error={error}
        />
      </main>
      <footer className="mt-8 sm:mt-12 text-center text-gray-500 text-xs sm:text-sm">
        <p>
          &copy; {new Date().getFullYear()} Application QuiMetLaTable. Tous
          droits réservés.
        </p>
      </footer>
    </div>
  );
}
