import { PrismaClient, Role, SpaceType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

interface SeedSpace {
    name: string;
    description: string;
    type: SpaceType;
    capacity: number;
    pricePerHour: number;
    imageUrl: string;
    isActive: boolean;
}

async function main(): Promise<void> {
    console.log("Iniciando proceso de seeding...");

    // 1. Limpieza de tablas existentes en orden de dependencia
    await prisma.booking.deleteMany();
    await prisma.space.deleteMany();
    await prisma.user.deleteMany();

    // 2. Creación del usuario Administrador
    const adminPassword = "AdminSecurePassword2026!";
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);

    const admin = await prisma.user.create({
        data: {
            name: "Administrador CoSpace",
            email: "admin@cospace.com",
            passwordHash,
            role: Role.ADMIN,
            refreshTokenHash: null,
        },
    });

    console.log(`Usuario administrador creado con éxito: ${admin.email}`);

    // 3. Catálogo inicial de 4 espacios de coworking
    const spacesData: SeedSpace[] = [
        {
            name: "Hot Desk Creativo A-1",
            description: "Escritorio flexible individual con monitor ergonómico 4K, conexión gigabit y café de cortesía en zona abierta.",
            type: SpaceType.DESK,
            capacity: 1,
            pricePerHour: 15.0,
            imageUrl: "https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80",
            isActive: true,
        },
        {
            name: "Cabina Insonorizada Silens 02",
            description: "Cabina acojinada con aislamiento acústico completo y ventilación forzada, optimizada para llamadas y videollamadas privadas.",
            type: SpaceType.BOOTH,
            capacity: 1,
            pricePerHour: 22.0,
            imageUrl: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80",
            isActive: true,
        },
        {
            name: "Sala de Juntas Vanguardia",
            description: "Sala ejecutiva para reuniones de equipo. Equipada con pantalla interactiva de 75 pulgadas, pizarra digital y videobar 4K.",
            type: SpaceType.MEETING_ROOM,
            capacity: 8,
            pricePerHour: 60.0,
            imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
            isActive: true,
        },
        {
            name: "Sala de Innovación & Workshop",
            description: "Espacio dinámico con mobiliario modular adaptable para talleres, presentaciones comerciales y sprints de desarrollo.",
            type: SpaceType.MEETING_ROOM,
            capacity: 14,
            pricePerHour: 95.0,
            imageUrl: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80",
            isActive: true,
        },
    ];

    for (const space of spacesData) {
        const createdSpace = await prisma.space.create({
            data: space,
        });
        console.log(`Espacio creado: ${createdSpace.name} (${createdSpace.type})`);
    }

    console.log("Seeding completado exitosamente.");
}

main()
    .catch((error: unknown) => {
        console.error("Error durante el seed:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });