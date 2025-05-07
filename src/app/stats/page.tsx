"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface Booking {
  date: string;
  meal: "lunch" | "dinner";
  reason: string;
}

const monthNames = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export default function StatsPage() {
  const [data, setData] = useState<{ [key: string]: number }>({});
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/book")
      .then((res) => res.json())
      .then((data) => {
        const bookings: Booking[] = data.bookings || [];
        const counts: { [key: string]: number } = {};
        bookings.forEach((b) => {
          const d = new Date(b.date);
          const key = `${d.getFullYear()}-${(d.getMonth() + 1)
            .toString()
            .padStart(2, "0")}`;
          counts[key] = (counts[key] || 0) + 1;
        });
        setData(counts);
        setStats(data.stats || null);
        setLoading(false);
      })
      .catch((e) => {
        setError("Erreur lors du chargement des données.");
        setLoading(false);
      });
  }, []);

  // Prepare chart data
  const labels = Object.keys(data)
    .sort()
    .map((key) => {
      const [year, month] = key.split("-");
      return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
    });
  const values = Object.keys(data)
    .sort()
    .map((key) => data[key]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-gray-800 text-gray-100 flex flex-col items-center p-4 sm:p-8 font-sans">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 drop-shadow-lg">
          Statistiques des remplacements
        </h1>
        <a
          href="/"
          className="inline-block mt-4 px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-md hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Retour à l'accueil
        </a>
      </header>
      {loading ? (
        <p>Chargement…</p>
      ) : error ? (
        <div className="bg-red-800 border border-red-600 text-white px-4 py-3 rounded-lg mb-6 max-w-md">
          {error}
        </div>
      ) : (
        <>
          <div className="w-full max-w-2xl bg-gray-800 rounded-xl shadow-2xl p-6 mb-8">
            <Bar
              data={{
                labels,
                datasets: [
                  {
                    label: "Nombre de réservations",
                    data: values,
                    backgroundColor: "#a78bfa",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  x: {
                    grid: { color: "#444" },
                    ticks: { color: "#fff" },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: "#444" },
                    ticks: { color: "#fff" },
                  },
                },
              }}
            />
          </div>
          {stats && (
            <div className="w-full max-w-2xl bg-gray-900 rounded-xl shadow-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-teal-300">
                Statistiques globales
              </h2>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-[180px] bg-gray-700 rounded-lg px-4 py-2 text-lg font-semibold text-white text-center">
                  Actives :{" "}
                  <span className="text-teal-300">{stats.actives}</span>
                </div>
                <div className="flex-1 min-w-[180px] bg-green-900 rounded-lg px-4 py-2 text-lg font-semibold text-green-200 text-center">
                  Remboursées :{" "}
                  <span className="text-green-300">{stats.remboursee}</span>
                </div>
                <div className="flex-1 min-w-[180px] bg-purple-900 rounded-lg px-4 py-2 text-lg font-semibold text-purple-200 text-center">
                  Total : <span className="text-purple-300">{stats.total}</span>
                </div>
                <div className="flex-1 min-w-[180px] bg-blue-900 rounded-lg px-4 py-2 text-lg font-semibold text-blue-200 text-center">
                  Remboursées aujourd'hui :{" "}
                  <span className="text-blue-300">{stats.refundToday}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold mt-6 mb-2 text-teal-200">
                Par raison
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr>
                      <th className="px-2 py-1">Raison</th>
                      <th className="px-2 py-1">Actives</th>
                      <th className="px-2 py-1">Remboursées</th>
                      <th className="px-2 py-1">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.reasonStats || {}).map(
                      ([reason, s]: any) => (
                        <tr key={reason}>
                          <td className="px-2 py-1 font-medium">{reason}</td>
                          <td className="px-2 py-1 text-teal-300">
                            {s.actives}
                          </td>
                          <td className="px-2 py-1 text-green-300">
                            {s.remboursee}
                          </td>
                          <td className="px-2 py-1 text-purple-300">
                            {s.total}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
