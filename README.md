# CoSpace — Plataforma Integral de Coworking por Horas

CoSpace es una aplicación web fullstack diseñada para la gestión y reserva instantánea de espacios de coworking (escritorios compartidos, salas de juntas y cabinas insonorizadas). Desarrollada con la arquitectura moderna de **Next.js 16 (App Router)** en modo Standalone, **TypeScript**, y **Prisma ORM** sobre una base de datos **PostgreSQL (Supabase)**.

La plataforma implementa un modelo de seguridad basado en tokens JWT (Access & Refresh) transmitidos estrictamente mediante cookies `httpOnly`, protección de rutas perimetral con `proxy.ts`, y un motor de validaciones en backend que blinda 10 reglas de negocio críticas para la operación concurrente del negocio.

---

## 🌐 Enlaces del Proyecto

- **Aplicación Desplegada (Vercel):** `https://[TU_PROYECTO].vercel.app`
- **Repositorio de Código (GitHub):** `https://github.com/[TU_USUARIO]/cospace`

---

## 📦 Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de contar con el siguiente entorno:
- **Node.js:** Versión `20.x` o superior (probado en Node v22).
- **npm:** Versión `10.x` o superior.
- **Git** instalado.
- Cuenta o instancia activa de **PostgreSQL / Supabase**.
- **Docker & Docker Compose** (opcional, para ejecución en contenedores).

---

## 🔐 Configuración de Variables de Entorno (`.env.example`)

Copia la plantilla `.env.example` en un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env

```

### Tabla de Variables Requeridas

| Variable | Descripción Técnica | Origen / Ejemplo de Valor |
| --- | --- | --- |
| `DATABASE_URL` | Cadena de conexión con pooler/directa a PostgreSQL. | En Supabase: *Project Settings -> Database -> Connection String (URI)* con pooling en modo session o transaction. |
| `JWT_ACCESS_SECRET` | Llave secreta criptográfica de 64 bytes para firmar Access Tokens (15 min). | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Llave secreta criptográfica de 64 bytes para firmar Refresh Tokens (7 días). | Cadena hexadecimal independiente generada con el mismo comando. |
| `ACCESS_TOKEN_EXPIRES_IN` | Tiempo de vida del token de acceso de corta duración. | `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | Tiempo de vida del token de renovación. | `7d` |

### Plantilla de ejemplo (`.env.example`):

```env
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION][.pooler.supabase.com:6543/postgres?pgbouncer=true](https://.pooler.supabase.com:6543/postgres?pgbouncer=true)"
JWT_ACCESS_SECRET="coloca_aqui_un_hash_seguro_de_64_bytes_para_access_token"
JWT_REFRESH_SECRET="coloca_aqui_un_hash_seguro_de_64_bytes_para_refresh_token"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

```

---

## 🚀 Guía de Instalación y Ejecución Local

Ejecuta los siguientes comandos en orden estricto desde la raíz del proyecto:

```bash
# 1. Clonar el repositorio y acceder a la carpeta
git clone [https://github.com/](https://github.com/)[TU_USUARIO]/cospace.git
cd cospace

# 2. Instalar dependencias exactas
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Abre .env y coloca tus credenciales reales de base de datos y llaves JWT

# 4. Generar cliente de Prisma y ejecutar migraciones
npx prisma generate
npx prisma migrate dev --name init

# 5. Ejecutar la semilla inicial (Crea Admin y 4 espacios de prueba)
npx prisma db seed

# 6. Ejecutar en modo desarrollo
npm run dev

```

La aplicación quedará disponible en: `http://localhost:3000`

---

## 🔑 Credenciales de Acceso Inicial (Seed)

El script `prisma/seed.ts` genera automáticamente el usuario administrador para pruebas:

* **Correo Electrónico:** `admin@cospace.com`
* **Contraseña:** `AdminSecurePassword2026!`
* **Rol:** `ADMIN`

> **Nota:** Puedes registrar usuarios estándar adicionales directamente desde la interfaz en `/register`.

---

## 🐳 Ejecución con Docker

El proyecto está configurado con compilación multi-stage optimizada en modo `standalone`:

### Opción 1: Docker Compose (Recomendado)

```bash
docker compose up --build -d

```

Para detener los contenedores:

```bash
docker compose down

```

### Opción 2: Docker CLI Directo

```bash
# Construir la imagen
docker build -t cospace-app .

# Correr el contenedor
docker run -d -p 3000:3000 --env-file .env --name cospace_instance cospace-app

```

---

## 📜 Scripts del Proyecto (`package.json`)

* `npm run dev`: Inicia el servidor de desarrollo en `http://localhost:3000`.
* `npm run build`: Genera la compilación de producción optimizada (`standalone`).
* `npm run start`: Inicia el servidor de producción compilado.
* `npm run lint`: Ejecuta el análisis estático de ESLint.
* `npm run test`: Corre la suite de pruebas unitarias de reglas de negocio con **Vitest**.
* `npx prisma studio`: Abre la interfaz gráfica interactiva para explorar la base de datos en `http://localhost:5555`.

---

## 🏗️ Arquitectura del Sistema

El proyecto sigue una arquitectura desacoplada, con tipado estricto (cero tipos `any`) y separación clara de responsabilidades:

```text
cospace/
├── prisma/
│   ├── schema.prisma              # Definición de modelos (User, Space, Booking) y Enums
│   └── seed.ts                    # Semilla idempotente con Admin y catálogo inicial
├── tests/
│   └── booking-rules.test.ts      # Suite de pruebas unitarias automatizadas (Vitest)
├── src/
│   ├── proxy.ts                   # Interceptor perimetral Next.js 16 para protección de rutas
│   ├── app/
│   │   ├── (public)/              # Layout con Navbar pública, selector i18n y Footer
│   │   │   ├── page.tsx           # Landing Page (SSG)
│   │   │   └── spaces/            # Catálogo y Detalle con BookingForm (SSR con force-dynamic)
│   │   ├── (auth)/                # Layout centrado para Login y Registro
│   │   ├── (private)/             # Layout autenticado con Navbar privada
│   │   │   └── dashboard/         # Panel "Mis Reservas" con cancelación interactiva (CSR)
│   │   ├── (admin)/               # Layout de administración restringido
│   │   │   └── admin/spaces/      # Gestión y desactivación lógica de espacios
│   │   └── api/                   # Route Handlers RESTful
│   │       ├── auth/              # /register, /login, /refresh, /logout, /me
│   │       ├── spaces/            # GET, POST, PATCH (/api/spaces y /api/spaces/[id])
│   │       └── bookings/          # GET, POST, PATCH (/api/bookings y [id]/cancel)
│   ├── components/
│   │   ├── admin/                 # Modales y formularios de administración
│   │   ├── auth/                  # LoginForm y RegisterForm
│   │   ├── shared/                # ThemeToggle, LanguageSwitcher, LocalClock (cero mismatch)
│   │   └── spaces/                # BookingForm, SpaceCard
│   ├── lib/
│   │   ├── prisma.ts              # Cliente Singleton de Prisma
│   │   ├── jwt.ts                 # Firma/verificación Web Crypto con jose
│   │   ├── cookies.ts             # Manipulación segura de cookies httpOnly
│   │   ├── auth-guard.ts          # Validación de sesión y rol en handlers (defensa en profundidad)
│   │   ├── booking-rules.ts       # Lógica desacoplada de reglas de negocio para testing
│   │   └── i18n/                  # Diccionarios bilingües (ES/EN) y contexto React
│   └── types/
│       └── index.ts               # Interfaces y DTOs centralizados
├── Dockerfile                     # Construcción multi-stage ligera en Node Alpine
├── docker-compose.yml             # Orquestación local en puerto 3000
└── vitest.config.ts               # Configuración de pruebas unitarias

```

---

## ⚖️ Reglas de Negocio Implementadas en Backend

Todas las restricciones operativas se validan en el servidor para evitar manipulaciones en el cliente:

1. **Horas completas:** Las reservas inician y terminan en minuto y segundo cero (ej. 09:00 a 11:00).
2. **Duración:** Permitida exclusivamente entre 1 y 4 horas consecutivas.
3. **Horario operativo:** Ventana estricta de atención de 07:00 a 21:00.
4. **Ventana de anticipación:** No se puede reservar en el pasado ni a más de 30 días vista.
5. **Traslape de espacio:** No se admiten dos reservas simultáneas para un mismo espacio (`startTime < existingEnd && endTime > existingStart`). La concurrencia contigua sí se permite (si termina a las 12:00, otra puede arrancar a las 12:00).
6. **Traslape de usuario:** Un usuario no puede tener dos reservas activas en el mismo intervalo de tiempo, ni siquiera en espacios distintos.
7. **Límite por usuario:** Máximo 3 reservas futuras confirmadas simultáneas por usuario.
8. **Espacio inactivo:** No se pueden reservar espacios marcados con `isActive: false`.
9. **Desactivación protegida:** Un administrador no puede desactivar un espacio si tiene reservas futuras confirmadas (`409 Conflict`).
10. **Cálculo de precio en servidor:** `totalPrice = duracionHoras * space.pricePerHour`, ignorando datos enviados por el cliente.
11. **Cancelación segura:** Requiere al menos 2 horas de anticipación a la hora de inicio (los administradores pueden cancelar en cualquier momento). Cancela actualizando el estado a `CANCELLED`, sin eliminar el registro histórico.

```
