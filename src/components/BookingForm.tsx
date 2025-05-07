import React from "react";
import { PRESET_REASONS } from "../config";

interface BookingFormProps {
  date: string;
  meal: "lunch" | "dinner";
  reason: string;
  isLoading: boolean;
  editingBooking: any;
  onDateChange: (date: string) => void;
  onMealChange: (meal: "lunch" | "dinner") => void;
  onReasonChange: (reason: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  date,
  meal,
  reason,
  isLoading,
  editingBooking,
  onDateChange,
  onMealChange,
  onReasonChange,
  onSubmit,
  onCancelEdit,
}) => (
  <section className="card-apple">
    <h2 className="text-2xl font-semibold mb-6" style={{ color: "#fffff" }}>
      Remplacement à déclarer
    </h2>
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Date
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          required
          className="input-apple w-full"
        />
      </div>
      <div>
        <label
          htmlFor="meal"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Repas
        </label>
        <select
          id="meal"
          value={meal}
          onChange={(e) => onMealChange(e.target.value as "lunch" | "dinner")}
          required
          className="input-apple w-full"
        >
          <option value="lunch">Déjeuner</option>
          <option value="dinner">Dîner</option>
        </select>
      </div>
      <div>
        <label
          htmlFor="reason"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Motif ou commentaire
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {PRESET_REASONS.map((preset) => (
            <button
              type="button"
              key={preset}
              className={`btn-apple text-xs px-3 py-1 ${
                reason === preset ? "ring-2 ring-blue-400" : ""
              }`}
              onClick={() => onReasonChange(preset)}
            >
              {preset}
            </button>
          ))}
        </div>
        <textarea
          id="reason"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          rows={3}
          required
          className="input-apple w-full"
          placeholder="Ex: Je dépanne pour cause d'examens, etc."
        />
      </div>
      <button type="submit" disabled={isLoading} className="btn-apple w-full">
        {isLoading
          ? editingBooking
            ? "Mise à jour..."
            : "Enregistrement..."
          : editingBooking
          ? "Mettre à jour"
          : "Ajouter"}
      </button>
      {editingBooking && (
        <button
          type="button"
          onClick={onCancelEdit}
          className="btn-apple w-full mt-2 bg-[#e5e5ea] hover:bg-[#f5f5f7]"
        >
          Annuler la modification
        </button>
      )}
    </form>
  </section>
);

export default BookingForm;
