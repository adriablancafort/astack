

# AStack

AStack es una plantilla de inicio con opiniones técnicas claras para crear rápidamente aplicaciones con estructura de producto sin reinventar la rueda. Optimizada para generación de código con IA.

Se distribuye como un monorepo de pnpm con:

- una SPA con Vite + React
- una API con Hono
- Drizzle ORM sobre PostgreSQL
- Better Auth para autenticación
- un paquete compartido para esquemas Zod y tipos TypeScript
- React Query para una gestión robusta del estado del cliente y la obtención de datos

El repositorio es intencionalmente pequeño y directo. Está pensado como un punto de partida que puedes extender, no como un marco de trabajo con el que tengas que luchar.

## Stack

- Frontend: Vite, React, TanStack Router, React Query, React Hook Form
- Backend: Hono, Better Auth, Drizzle ORM, PostgreSQL
- Contratos compartidos: Zod + TypeScript en `packages/shared`
- UI: paquete compartido de componentes en `packages/ui`
- Herramientas: pnpm workspaces, TypeScript, Biome

## Estructura del Monorepo

```text
.
├── apps/
│   ├── api/      # API de Hono e integración con Better Auth
│   └── app/      # SPA de React con Vite
├── packages/
│   ├── db/       # Esquema de Drizzle ORM, migraciones y cliente de BD
│   ├── shared/   # Esquemas Zod compartidos y tipos TS usados por app + api
│   └── ui/       # Componentes UI compartidos y estilos globales
├── package.json
└── pnpm-workspace.yaml
```

## Arquitectura

### Frontend

La SPA reside en `apps/app`.

- `src/main.tsx` configura React Query, soporte de temas, tooltips, TanStack Router y notificaciones toast.
- `src/routes/` contiene rutas basadas en archivos divididas en áreas autorizadas y no autorizadas.
- `src/lib/api.ts` es un envoltorio ligero para fetch para interactuar con la API.
- `src/lib/auth-client.ts` expone el cliente de React de Better Auth.

El frontend se comunica con el backend a través de HTTP y se basa en esquemas Zod compartidos desde `@workspace/shared` para mantener alineados los tipos de solicitudes y respuestas.

### Backend

La API reside en `apps/api`.

- `src/index.ts` inicia el servidor Hono.
- `src/api.ts` crea la aplicación Hono, habilita CORS y registros, monta Better Auth en `/api/auth/*` y monta las rutas de las funcionalidades en `/api/*`.
- `src/lib/auth.ts` configura Better Auth utilizando el adaptador de Drizzle.
- `src/routes/tasks.ts` muestra el patrón previsto: validar la entrada con esquemas Zod compartidos, leer al usuario autenticado desde Better Auth y luego consultar la base de datos con Drizzle.

### Contratos Compartidos

`packages/shared` es la capa de contratos entre el frontend y el backend.

El ejemplo actual es `packages/shared/src/api/tasks.ts`, que define:

- Esquemas Zod para entradas y salidas de tareas
- tipos TypeScript inferidos para el uso en la aplicación y la API
- valores similares a enums compartidos, como el estado de la tarea

Esto significa que la validación y los tipos se definen una vez y se reutilizan en ambos lados.

### Paquete de UI

`packages/ui` contiene bloques de construcción UI compartidos y estilos globales para que la SPA se mantenga ligera y reutilizable.

## Autenticación

La autenticación está implementada con Better Auth.

- El servidor monta los manejadores de autenticación en `/api/auth/*`.
- El frontend utiliza el cliente React de Better Auth desde `apps/app/src/lib/auth/client.ts`.
- La autenticación basada en sesiones funciona entre el frontend y la API porque las solicitudes incluyen cookies.

La plantilla actual ya está configurada para autenticación por correo electrónico/contraseña.

## Base de Datos

Drizzle se utiliza como ORM y fuente de verdad para el esquema.

- definición del esquema: `packages/db/src/schema/`
- cliente de base de datos: `packages/db/src/client.ts`
- configuración de Drizzle: `packages/db/drizzle.config.ts`
- migraciones generadas: `packages/db/drizzle/`

La plantilla ya incluye tablas de autenticación y un recurso de tareas simple, por lo que existe un ejemplo completo de principio a fin de:

- definición de esquema compartido
- ruta de API autenticada
- persistencia en base de datos
- obtención de datos y mutaciones con React Query

## Inicialización

La forma más rápida de iniciar un nuevo proyecto AStack es con el paquete [create-astack](https://www.npmjs.com/package/create-astack):

```bash
pnpm create astack
```

## Configuración

### 1. Instalar dependencias

```bash
pnpm install
```

### 2. Configurar variables de entorno

Crea los archivos de entorno locales a partir de los ejemplos.

Para la API en `apps/api/.env`:

```env
FRONTEND_URL=http://localhost:5173
API_URL=http://localhost:3000
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/astack
BETTER_AUTH_SECRET=
```

Para la SPA en `apps/app/.env`:

```env
VITE_FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3000
```

### 3. Preparar la base de datos

Ejecuta el comando de migración de Drizzle desde el espacio de trabajo de la base de datos:

```bash
pnpm --filter @workspace/db migrate
```

Si prefieres sincronizar el esquema directamente durante el desarrollo inicial:

```bash
pnpm --filter @workspace/db push
```

### 4. Iniciar las aplicaciones

En una terminal:

```bash
pnpm --filter api dev
```

En otra terminal:

```bash
pnpm --filter app dev
```

Luego abre `http://localhost:5173`.

## Cómo Extenderlo

El flujo de trabajo previsto para nuevas funcionalidades es:

1. Define o actualiza los esquemas Zod compartidos en `packages/shared`.
2. Implementa la ruta del backend en `apps/api` utilizando esos esquemas.
3. Utiliza los tipos inferidos compartidos en la SPA.
4. Llama al punto final a través de `apps/app/src/lib/api.ts`.
5. Gestiona el estado de obtención de datos con React Query.
