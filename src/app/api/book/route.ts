import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

function isAllowedEmail(email?: string | null): boolean {
  if (!email) return false;
  const allowedEmails = process.env.ALLOWED_EMAILS?.split(",") || [];
  return allowedEmails.includes(email);
}

// Define a schema for input validation
const bookingSchema = z.object({
  date: z.string().nonempty("Date is required"),
  meal: z.enum(["lunch", "dinner"], {
    errorMap: () => ({ message: "Meal must be either lunch or dinner" }),
  }),
  reason: z.string().nonempty("Reason is required").optional(),
  reimbursedBy: z.string().optional(), // Qui doit rembourser
  remboursee: z.boolean().optional(), // Ajout du champ remboursé
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !process.env.NEXT_PUBLIC_DEVELOPMENT &&
    (!session || !isAllowedEmail(session.user?.email))
  ) {
    return NextResponse.json(
      { message: "Authentication required or not allowed." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { date, reason, meal, reimbursedBy, remboursee } =
      bookingSchema.parse(body); // Validate input

    const db = await dbConnect();
    const collection = db.collection("bookings");

    const bookingsResult = await collection.findOne({ date, meal });
    if (bookingsResult) {
      await collection.updateOne(
        { date, meal }, // Use both date and meal as filter
        { $set: { reason, meal, reimbursedBy, remboursee } }
      );
      return NextResponse.json(
        { message: "Booking updated successfully" },
        { status: 200 }
      );
    }

    await collection.insertOne({
      date,
      reason,
      meal,
      reimbursedBy,
      remboursee,
    }); // Use insertOne for new bookings
    return NextResponse.json(
      { message: "Booking created successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST handler:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !process.env.NEXT_PUBLIC_DEVELOPMENT &&
    (!session || !isAllowedEmail(session.user?.email))
  ) {
    return NextResponse.json(
      { message: "Authentication required or not allowed." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { date, meal } = bookingSchema.parse(body);
    const db = await dbConnect();
    const collection = db.collection("bookings");
    const result = await collection.updateOne(
      { date, meal },
      { $set: { remboursee: true } }
    );
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: "Aucune réservation trouvée à rembourser." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { message: "Réservation remboursée avec succès." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Erreur lors du remboursement." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const db = await dbConnect();
    const collection = db.collection("bookings");

    // Récupérer toutes les réservations
    const allBookings = await collection.find({}).toArray();

    // Séparer les réservations actives et remboursées
    const bookings = allBookings.filter((b: any) => b.remboursee !== true);
    const rembourses = allBookings.filter((b: any) => b.remboursee === true);

    // Statistiques pour les raisons
    const reasonStats: Record<
      string,
      { actives: number; remboursee: number; total: number }
    > = {};
    for (const reason of (await import("@/config")).PRESET_REASONS) {
      reasonStats[reason] = { actives: 0, remboursee: 0, total: 0 };
    }

    // Statistiques par personne qui doit rembourser
    const reimbursedByStats: Record<
      string,
      { actives: number; remboursee: number; total: number }
    > = {};
    for (const person of (await import("@/config")).PEOPLE_LIST) {
      reimbursedByStats[person] = { actives: 0, remboursee: 0, total: 0 };
    }

    // Statistiques par repas
    const mealStats = {
      lunch: { actives: 0, remboursee: 0, total: 0 },
      dinner: { actives: 0, remboursee: 0, total: 0 },
    };

    // Statistiques par mois
    const monthlyStats: Record<
      string,
      { actives: number; remboursee: number; total: number }
    > = {};

    allBookings.forEach((b: any) => {
      const r = b.reason || "Autre";
      const person = b.reimbursedBy || "Non spécifié";
      const meal = b.meal || "lunch";
      const date = new Date(b.date);
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      // Stats par raison
      if (!reasonStats[r])
        reasonStats[r] = { actives: 0, remboursee: 0, total: 0 };
      if (b.remboursee === true) {
        reasonStats[r].remboursee++;
      } else {
        reasonStats[r].actives++;
      }
      reasonStats[r].total++;

      // Stats par personne
      if (!reimbursedByStats[person])
        reimbursedByStats[person] = { actives: 0, remboursee: 0, total: 0 };
      if (b.remboursee === true) {
        reimbursedByStats[person].remboursee++;
      } else {
        reimbursedByStats[person].actives++;
      }
      reimbursedByStats[person].total++;

      // Stats par repas
      if (b.remboursee === true) {
        mealStats[meal as keyof typeof mealStats].remboursee++;
      } else {
        mealStats[meal as keyof typeof mealStats].actives++;
      }
      mealStats[meal as keyof typeof mealStats].total++;

      // Stats par mois
      if (!monthlyStats[monthKey])
        monthlyStats[monthKey] = { actives: 0, remboursee: 0, total: 0 };
      if (b.remboursee === true) {
        monthlyStats[monthKey].remboursee++;
      } else {
        monthlyStats[monthKey].actives++;
      }
      monthlyStats[monthKey].total++;
    });

    // Statistiques pour les réservations remboursées aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const refundToday = allBookings.filter((b: any) => {
      if (b.remboursee === true && b.updatedAt) {
        const d = new Date(b.updatedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
      }
      return false;
    });

    // Statistiques pour toutes les réservations (actives + remboursées)
    const allStats = {
      total: allBookings.length,
      remboursee: rembourses.length,
      actives: bookings.length,
      refundToday: refundToday.length,
    };

    return NextResponse.json(
      {
        bookings: [...allBookings],
        stats: {
          ...allStats,
          reasonStats,
          reimbursedByStats,
          mealStats,
          monthlyStats,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (
    !process.env.NEXT_PUBLIC_DEVELOPMENT &&
    (!session || !isAllowedEmail(session.user?.email))
  ) {
    return NextResponse.json(
      { message: "Authentication required or not allowed." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { date, meal } = bookingSchema.parse(body); // Validate input (now requires meal)

    const db = await dbConnect();
    const collection = db.collection("bookings");

    const bookingsResult = await collection.findOne({ date, meal });
    if (!bookingsResult) {
      return NextResponse.json(
        { message: "No booking found for the given date and meal" },
        { status: 404 }
      );
    }

    await collection.deleteOne({ date, meal });
    return NextResponse.json(
      { message: "Booking deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in DELETE handler:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
