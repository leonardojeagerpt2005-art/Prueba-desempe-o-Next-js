import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth-guard";
import { BookingStatus, Role, Prisma } from "@prisma/client";

const createBookingSchema = z.object({
  spaceId: z.string().uuid("ID de espacio inválido"),
  startTime: z.string().datetime({ message: "startTime debe ser formato ISO válido" }),
  endTime: z.string().datetime({ message: "endTime debe ser formato ISO válido" }),
});

// GET /api/bookings -> Listar reservas propias (o todas si es ADMIN con ?all=true)
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse || !user) return errorResponse!;

    const { searchParams } = new URL(req.url);
    const showAll = searchParams.get("all") === "true";

    const whereClause: Prisma.BookingWhereInput =
      showAll && user.role === Role.ADMIN ? {} : { userId: user.userId };

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        space: {
          select: {
            id: true,
            name: true,
            type: true,
            imageUrl: true,
            pricePerHour: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/bookings:", error);
    return NextResponse.json({ error: "Error al obtener las reservas" }, { status: 500 });
  }
}

// POST /api/bookings -> Crear reserva con validación estricta de las reglas de negocio
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse || !user) return errorResponse!;

    const body: unknown = await req.json();
    const result = createBookingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Datos de reserva inválidos", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { spaceId, startTime: startIso, endTime: endIso } = result.data;
    const start = new Date(startIso);
    const end = new Date(endIso);
    const now = new Date();

    // 1. No se puede reservar en el pasado
    if (start <= now) {
      return NextResponse.json(
        { error: "No se puede reservar en una fecha u hora pasada" },
        { status: 400 }
      );
    }

    // 2. No más de 30 días de anticipación
    const maxFutureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    if (start > maxFutureDate) {
      return NextResponse.json(
        { error: "No se pueden realizar reservas con más de 30 días de anticipación" },
        { status: 400 }
      );
    }

    // 3. Horas completas exactas (minutos, segundos y milisegundos en 0)
    if (
      start.getMinutes() !== 0 ||
      start.getSeconds() !== 0 ||
      start.getMilliseconds() !== 0 ||
      end.getMinutes() !== 0 ||
      end.getSeconds() !== 0 ||
      end.getMilliseconds() !== 0
    ) {
      return NextResponse.json(
        { error: "Las reservas deben ser en horas completas (ejemplo: 10:00 a 12:00)" },
        { status: 400 }
      );
    }

    // 4. Duración entre 1 y 4 horas
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (durationHours < 1 || durationHours > 4 || !Number.isInteger(durationHours)) {
      return NextResponse.json(
        { error: "La reserva debe durar entre 1 y 4 horas completas" },
        { status: 400 }
      );
    }

    // 5. Horario operativo entre las 07:00 y las 21:00
    // Soporta tanto horas locales como UTC para compatibilidad
    const startHourLocal = start.getHours();
    const endHourLocal = end.getHours();
    const isLocalValid =
      startHourLocal >= 7 &&
      (endHourLocal < 21 || (endHourLocal === 21 && end.getMinutes() === 0));

    const startHourUtc = start.getUTCHours();
    const endHourUtc = end.getUTCHours();
    const isUtcValid =
      startHourUtc >= 7 &&
      (endHourUtc < 21 || (endHourUtc === 21 && end.getUTCMinutes() === 0));

    if (!isLocalValid && !isUtcValid) {
      return NextResponse.json(
        { error: "El horario de reserva debe estar comprendido entre las 07:00 y las 21:00" },
        { status: 400 }
      );
    }

    // 6. Verificar existencia y estado del espacio
    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      return NextResponse.json({ error: "El espacio solicitado no existe" }, { status: 404 });
    }
    if (!space.isActive) {
      return NextResponse.json(
        { error: "No se puede reservar un espacio desactivado" },
        { status: 400 }
      );
    }

    // 7. Límite de 3 reservas futuras confirmadas por usuario
    const userActiveBookingsCount = await prisma.booking.count({
      where: {
        userId: user.userId,
        status: BookingStatus.CONFIRMED,
        startTime: { gt: now },
      },
    });

    if (userActiveBookingsCount >= 3) {
      return NextResponse.json(
        { error: "Has alcanzado el límite de 3 reservas futuras activas permitidas" },
        { status: 409 }
      );
    }

    // 8. Solapamiento del espacio: start < existingEnd AND end > existingStart
    const spaceOverlap = await prisma.booking.findFirst({
      where: {
        spaceId,
        status: BookingStatus.CONFIRMED,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (spaceOverlap) {
      return NextResponse.json(
        { error: "El espacio ya se encuentra reservado en el horario seleccionado" },
        { status: 409 }
      );
    }

    // 9. Solapamiento del usuario (incluso en espacios distintos)
    const userOverlap = await prisma.booking.findFirst({
      where: {
        userId: user.userId,
        status: BookingStatus.CONFIRMED,
        startTime: { lt: end },
        endTime: { gt: start },
      },
    });

    if (userOverlap) {
      return NextResponse.json(
        { error: "Ya cuentas con otra reserva confirmada en este mismo intervalo horario" },
        { status: 409 }
      );
    }

    // 10. Cálculo estricto del precio en el servidor
    const totalPrice = Number((durationHours * space.pricePerHour).toFixed(2));

    const newBooking = await prisma.booking.create({
      data: {
        userId: user.userId,
        spaceId,
        startTime: start,
        endTime: end,
        totalPrice,
        status: BookingStatus.CONFIRMED,
      },
      include: {
        space: true,
      },
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/bookings:", error);
    return NextResponse.json({ error: "Error interno al procesar la reserva" }, { status: 500 });
  }
}
