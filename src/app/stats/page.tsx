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
import { Booking } from "@/types/booking";
import LoadingCircle from "@/components/LoadingCircle";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
          className="btn-apple inline-block mt-4 px-6 py-2 rounded-lg  text-white font-semibold shadow-md"
        >
          Retour à l'accueil
        </a>
      </header>
      {loading ? (
        <LoadingCircle text="Chargement des données" />
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
            <div className="w-full max-w-6xl bg-gray-900 rounded-xl shadow-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-teal-300">
                Statistiques globales
              </h2>
              <div className="flex flex-wrap gap-4 mb-6">
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

              {/* Statistiques par repas */}
              <h3 className="text-xl font-bold mt-6 mb-3 text-teal-200">
                Par repas
              </h3>
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex-1 min-w-[200px] bg-orange-900 rounded-lg px-4 py-2 text-center">
                  <h4 className="font-bold text-orange-200">Déjeuners</h4>
                  <div className="text-sm">
                    <span className="text-orange-300">
                      Total: {stats.mealStats?.lunch?.total || 0}
                    </span>{" "}
                    |{" "}
                    <span className="text-green-300">
                      Remboursés: {stats.mealStats?.lunch?.remboursee || 0}
                    </span>{" "}
                    |{" "}
                    <span className="text-red-300">
                      Actifs: {stats.mealStats?.lunch?.actives || 0}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-[200px] bg-indigo-900 rounded-lg px-4 py-2 text-center">
                  <h4 className="font-bold text-indigo-200">Dîners</h4>
                  <div className="text-sm">
                    <span className="text-indigo-300">
                      Total: {stats.mealStats?.dinner?.total || 0}
                    </span>{" "}
                    |{" "}
                    <span className="text-green-300">
                      Remboursés: {stats.mealStats?.dinner?.remboursee || 0}
                    </span>{" "}
                    |{" "}
                    <span className="text-red-300">
                      Actifs: {stats.mealStats?.dinner?.actives || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Statistiques par personne */}
              <h3 className="text-xl font-bold mt-6 mb-3 text-teal-200">
                Par personne qui doit rembourser
              </h3>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full text-sm text-left bg-gray-800 rounded-lg">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-4 py-2 text-teal-200">Personne</th>
                      <th className="px-4 py-2 text-red-300">Actives</th>
                      <th className="px-4 py-2 text-green-300">Remboursées</th>
                      <th className="px-4 py-2 text-purple-300">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.reimbursedByStats || {}).map(
                      ([person, s]: any) => (
                        <tr key={person} className="border-t border-gray-600">
                          <td className="px-4 py-2 font-medium text-white">
                            {person}
                          </td>
                          <td className="px-4 py-2 text-red-300">
                            {s.actives}
                          </td>
                          <td className="px-4 py-2 text-green-300">
                            {s.remboursee}
                          </td>
                          <td className="px-4 py-2 text-purple-300">
                            {s.total}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-bold mt-6 mb-2 text-teal-200">
                Par raison
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left bg-gray-800 rounded-lg">
                  <thead>
                    <tr className="bg-gray-700">
                      <th className="px-4 py-2 text-teal-200">Raison</th>
                      <th className="px-4 py-2 text-red-300">Actives</th>
                      <th className="px-4 py-2 text-green-300">Remboursées</th>
                      <th className="px-4 py-2 text-purple-300">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.reasonStats || {}).map(
                      ([reason, s]: any) => (
                        <tr key={reason} className="border-t border-gray-600">
                          <td className="px-4 py-2 font-medium text-white">
                            {reason}
                          </td>
                          <td className="px-4 py-2 text-red-300">
                            {s.actives}
                          </td>
                          <td className="px-4 py-2 text-green-300">
                            {s.remboursee}
                          </td>
                          <td className="px-4 py-2 text-purple-300">
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
