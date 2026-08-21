<div align="center">

<h1>
  <font color="#ff4200"><b>🎮 Zgaming</b></font>
</h1>

<p>Por si quieres ver → <a href="https://zgaming.vercel.app"><strong>Live Demo</strong></a></p>

![video-project](Video-Project.gif)

</div>

### Documentación técnica

<p align="left">
  <a href="docs/DOCUMENTACION_TECNICA.pdf"><strong>📄 Documentación Técnica (PDF)</strong></a>
  <br/>
  <a href="docs/MANUAL_USUARIO.pdf"><strong>📘 Manual de Usuario (PDF)</strong></a>
</p>

---

## 📋 Descripción

**Zgaming** es una aplicación web de catálogo de videojuegos para explorar, buscar y guardar juegos favoritos. No tiene sistema de cuentas ni login: cualquiera puede navegar libremente, y la lista de guardados (**Wishlist**, hasta 20 juegos) vive únicamente en el `localStorage` del navegador de cada usuario.

Se puede buscar por texto libre y filtrar por género, plataforma o tienda desde la página de búsqueda, o navegar directamente el catálogo de géneros/plataformas/tiendas desde secciones dedicadas y desde el mega menú del navbar (con vista previa en cards y acceso rápido).

### Arquitectura

El frontend es una app Next.js exportada como sitio estático (`output: 'export'`). Los datos de juegos no se piden a un backend externo: las funciones serverless de Vercel bajo `api/games` se conectan **directamente a MongoDB** (colecciones `database`, `genres`, `platforms`, `parent-platoforms` y `stores`), replicando en TypeScript la lógica de filtrado/orden que antes vivía en un servicio .NET (`CesarSobGamesService`). Así, en producción, tanto el sitio estático como las funciones se despliegan juntos en Vercel sin depender de un servidor propio siempre encendido.

---

## 🛠️ Tecnologías utilizadas

| Categoría | Tecnología |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, export estático) |
| Lenguaje | [TypeScript 5](https://www.typescriptlang.org/) |
| UI Library | [React 19](https://react.dev/) |
| Componentes | [PrimeReact 10](https://primereact.org/) + [PrimeIcons](https://primereact.org/icons/) |
| Estilos | [Tailwind CSS v4](https://tailwindcss.com/) |
| Botones animados | [react-ladda-button](https://www.npmjs.com/package/react-ladda-button) |
| Backend | [Vercel Functions](https://vercel.com/docs/functions) (`@vercel/node`) + [MongoDB](https://www.mongodb.com/) (driver oficial) |
| Persistencia de usuario | `localStorage` (Wishlist, aviso inicial) — sin base de datos de usuarios |
| Linting | [ESLint 9](https://eslint.org/) |

---

## 🗂️ Estructura del proyecto

```
├── api/                         # Vercel Functions (se despliegan junto al sitio estático)
│   ├── games/index.ts           # Endpoint único: lista, búsqueda, detalle, géneros/plataformas/tiendas
│   └── _lib/                    # Conexión a Mongo y lógica de filtrado/orden compartida
│
├── app/                         # Rutas y páginas (Next.js App Router)
│   ├── page.tsx                 # Página principal (Home)
│   ├── layout.tsx               # Layout global
│   ├── globals.css              # Estilos globales y variables de color
│   ├── game/                    # Detalle de un juego (?slug=)
│   ├── search/                  # Búsqueda general con filtros
│   ├── searchGenres/            # Catálogo de géneros
│   ├── searchPlatforms/         # Catálogo de plataformas
│   ├── searchStores/            # Catálogo de tiendas
│   ├── wishlist/                # Juegos guardados (localStorage) con filtros
│   └── legal/                   # Política de privacidad y condiciones de uso
│
├── components/                  # Componentes reutilizables
│   ├── ClientProviders.tsx      # Proveedores globales de cliente (tema, toast, aviso inicial)
│   ├── ToastProvider.tsx        # Notificaciones globales (ej. límite de Wishlist)
│   ├── WelcomeDialog.tsx        # Aviso inicial sobre cómo funciona la web
│   ├── game-carousel/           # Carrusel y card de juego (con botón de Wishlist)
│   └── hero-header/             # Cabecera hero de la home
│
├── features/                    # Lógica de negocio por sección
│   ├── home/                    # Vista principal con carruseles y catálogo
│   ├── detailed-game/           # Vista de detalle de juego
│   ├── search/                  # Resultados de búsqueda con filtros
│   ├── search-genres/           # Resultados por género
│   ├── search-platforms/        # Resultados por plataforma
│   ├── search-stores/           # Resultados por tienda
│   └── wishlist/                # Página de juegos guardados
│
├── services/                    # Servicios y llamadas a la API
│   ├── config.ts                # URL base por entorno (para endpoints ajenos a /api/games)
│   ├── GameService.ts           # Cliente del endpoint /api/games
│   ├── wishlist.ts              # Lectura/escritura de la Wishlist en localStorage
│   └── InfoService.ts           # Datos auxiliares
│
├── models/                      # Tipos e interfaces TypeScript
├── shared/                      # Navbar (con mega menú), Footer y enlaces sociales compartidos
└── public/                      # Recursos estáticos
```

Sin `vercel.json`: Vercel detecta el framework Next.js automáticamente (incluido `output: 'export'`) y despliega el export estático junto a las funciones de `api/` sin configuración manual de build/output.

---

## 🚀 Cómo iniciar el proyecto

### Requisitos previos

- [Node.js](https://nodejs.org/) v18 o superior
- npm (incluido con Node.js)
- Una base de datos MongoDB (Atlas u otra) con las colecciones del catálogo

### Variables de entorno

Copia `.env.local.example` a `.env.local` y rellena:

```
MONGODB_URI=
MONGODB_DB=
```

### Instalación y arranque en desarrollo

Como las funciones de `api/` son Vercel Functions (no rutas de Next.js), `npm run dev` (que solo levanta `next dev`) **no las sirve**. Para probar el sitio completo, incluida la conexión a Mongo, usa la CLI de Vercel:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar con la CLI de Vercel (sirve Next.js + las funciones de api/)
npx vercel dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador. Si solo necesitas trabajar en UI que no depende de `/api/games`, `npm run dev` es suficiente y más rápido.

### Otros comandos disponibles

```bash
# Modo desarrollo con Turbopack (más rápido)
npm run dev:turbo

# Compilar para producción
npm run build

# Iniciar en modo producción (requiere build previo)
npm start

# Ejecutar el linter
npm run lint
```
