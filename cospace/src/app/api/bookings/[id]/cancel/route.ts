import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth-guard";
import { BookingStatus, Role } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/bookings/[id]/cancel
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const { user, errorResponse } = await authenticateRequest(req);
    if (errorResponse || !user) return errorResponse!;

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    // Regla de Negocio: Solo el dueño o un ADMIN pueden cancelar
    const isOwner = booking.userId === user.userId;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "No tienes permiso para cancelar esta reserva" },
        { status: 403 }
      );
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return NextResponse.json(
        { error: "La reserva ya se encuentra cancelada" },
        { status: 400 }
      );
    }

    // Regla de Negocio: Un usuario solo puede cancelar con un mínimo de 2 horas de anticipación
    // (A menos que sea admin realizando gestión operativa)
    const now = new Date();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    const timeUntilStart = booking.startTime.getTime() - now.getTime();

    if (!isAdmin && timeUntilStart < twoHoursInMs) {
      return NextResponse.json(
        {
          error:
            "Las reservas solo pueden cancelarse con un mínimo de 2 horas de anticipación a su inicio",
        },
        { status: 409 }
      );
    }

    // Cancelar cambia el estado, nunca se elimina el registro de la DB
    const cancelledBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
      },
    });

    return NextResponse.json(
      { message: "Reserva cancelada con éxito", booking: cancelledBooking },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en PATCH /api/bookings/[id]/cancel:", error);
    return NextResponse.json({ error: "Error interno al cancelar la reserva" }, { status: 500 });
  }
}
