import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import { z } from "zod";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// Define a schema for input validation
const bookingSchema = z.object({
  date: z.string().nonempty("Date is required"),
  meal: z.enum(["lunch", "dinner"], {
    errorMap: () => ({ message: "Meal must be either lunch or dinner" }),
  }),
  reason: z.string().nonempty("Reason is required").optional(),
  remboursee: z.boolean().optional(), // Ajout du champ remboursé
});

function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed =
    process.env.ALLOWED_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ||
    [];
  return allowed.includes(email.toLowerCase());
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !isAllowedEmail(session.user?.email)) {
    return NextResponse.json(
      { message: "Authentication required or not allowed." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { date, reason, meal, remboursee } = bookingSchema.parse(body); // Validate input

    const db = await dbConnect();
    const collection = db.collection("bookings");

    const bookingsResult = await collection.findOne({ date, meal });
    if (bookingsResult) {
      await collection.updateOne(
        { date, meal }, // Use both date and meal as filter
        { $set: { reason, meal, remboursee } }
      );
      return NextResponse.json(
        { message: "Booking updated successfully" },
        { status: 200 }
      );
    }

    await collection.insertOne({ date, reason, meal, remboursee }); // Use insertOne for new bookings
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
  if (!session || !isAllowedEmail(session.user?.email)) {
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
    const allBookings = await collection.find({}).toArray();
    const bookings = allBookings.filter((b: any) => b.remboursee !== true);
    const rembourses = allBookings.filter((b: any) => b.remboursee === true);

    // Statistiques par raison
    const reasonStats: Record<
      string,
      { actives: number; remboursee: number; total: number }
    > = {};
    for (const reason of (await import("@/config")).PRESET_REASONS) {
      reasonStats[reason] = { actives: 0, remboursee: 0, total: 0 };
    }
    allBookings.forEach((b: any) => {
      const r = b.reason || "Autre";
      if (!reasonStats[r])
        reasonStats[r] = { actives: 0, remboursee: 0, total: 0 };
      if (b.remboursee === true) {
        reasonStats[r].remboursee++;
      } else {
        reasonStats[r].actives++;
      }
      reasonStats[r].total++;
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
  if (!session || !isAllowedEmail(session.user?.email)) {
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
