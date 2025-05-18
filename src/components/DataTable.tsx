import {Booking} from "@/types/Booking";

interface DataTableProps {
    bookingsData: Booking[];
}

export const DataTable: React.FC<DataTableProps> = ({ bookingsData }) => {
    return (
        <table className="min-w-full divide-y divide-gray-200 rounded-lg shadow-lg">
        <thead className="bg-[#18181c]">
            <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Repas
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Raison
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Remboursé
            </th>
            </tr>
        </thead>
        <tbody className="bg-[#18181c] divide-y divide-gray-200">
            {bookingsData.map((booking) => (
            <tr key={booking._id}>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(booking.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.meal === "lunch" ? "Déjeuner" : "Dîner"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap">{booking.remboursee === true ? "Oui" : "Non"}</td>
            </tr>
            ))}
        </tbody>
        </table>
    );
}