"use client";

import {DataTable} from "@/components/DataTable";
import { Booking } from "@/types/Booking";
import { useEffect, useState } from "react";
import LoadingCircle from "@/components/LoadingCircle";

export default function HistoryPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const API_URL = "/api/book";
    bookings.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
    });
    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch bookings");
                }
                const data = await response.json();
                setBookings(data.bookings || []);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);
    if (loading) {
        return <div className="text-center"><LoadingCircle text="Chargement..."/></div>;
    }
    if (error) {
        return (
            <div className="bg-red-800 border border-red-600 text-white px-4 py-3 rounded-lg relative mb-6 w-full max-w-md">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {error}</span>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-gray-800 text-gray-100 flex flex-col items-center p-4 sm:p-8 font-sans">
            <header className="mb-10 text-center">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 drop-shadow-lg">
                    Historique des remplacements
                </h1>
                <a
                    href="/"
                    className="btn-apple inline-block mt-4 px-6 py-2 rounded-lg  text-white font-semibold shadow-md"
                >
                    Retour à l'accueil
                </a>
            </header>
            <DataTable bookingsData={bookings} />
        </div>
    );
}