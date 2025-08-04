export interface Booking {
  _id?: string; // Assuming MongoDB adds an _id
  date: string;
  meal: "lunch" | "dinner";
  reason: string;
  remboursee?: boolean;
  reimbursedBy?: string; // Qui doit rembourser
}

export interface BookingsProps {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  onDelete: (date: string, meal: "lunch" | "dinner", reason: string) => void;
  onEdit: (booking: Booking) => void;
  onRefund: (date: string, meal: "lunch" | "dinner") => void;
  stats?: {
    actives: number;
    remboursee: number;
  };
}

export interface BookingFormProps {
  date: string;
  meal: "lunch" | "dinner";
  reason: string;
  reimbursedBy: string;
  isLoading: boolean;
  editingBooking: any;
  onDateChange: (date: string) => void;
  onMealChange: (meal: "lunch" | "dinner") => void;
  onReasonChange: (reason: string) => void;
  onReimbursedByChange: (person: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
}

export interface BookingListItemProps {
  booking: Booking;
  onDelete: (date: string, meal: "lunch" | "dinner", reason: string) => void;
  onEdit: (booking: Booking) => void;
  onRefund: (date: string, meal: "lunch" | "dinner") => void;
  isLoading: boolean;
  NoSession: boolean;
}

export interface BookingListProps {
  bookings: Booking[];
  isLoading: boolean;
  onDelete: (date: string, meal: "lunch" | "dinner", reason: string) => void;
  onEdit: (booking: Booking) => void;
  onRefund: (date: string, meal: "lunch" | "dinner") => void;
  error: string | null;
  NoSession: boolean;
}
