import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// W Prisma 7 musisz jawnie podać URL do konstruktora, jeśli config nie zaskoczył
const prisma = new PrismaClient();

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }, // Najnowsze na górze
      include: { selections: true }   // Pobierz też zdarzenia
    });
    
    return NextResponse.json(coupons);
  } catch (error: any) {
    console.error("GET BETS ERROR:", error);
    return NextResponse.json(
      { error: "Błąd pobierania historii" }, 
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Otrzymane dane:", data);

    // Walidacja danych przed zapisem
    if (!data.selections || data.selections.length === 0) {
      return NextResponse.json(
        { error: "Kupon nie zawiera zdarzeń" },
        { status: 400 },
      );
    }
    console.log(data);
    const newCoupon = await prisma.coupon.create({
      data: {
        status: "1", // Twój status dla aktywnego kuponu
        selections: {
          create: data.selections.map((s: any) => ({
            matchId: s.matchId,
            home: s.home,
            away: s.away,
            market: s.market,
            pick: s.pick,
            leagueSlug: s.leagueSlug,
          })),
        },
      },
      include: { selections: true },
    });

    return NextResponse.json(newCoupon);
  } catch (error: any) {
    console.error("PRISMA DB ERROR:", error);
    return NextResponse.json(
      {
        error: "Błąd zapisu kuponu",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
