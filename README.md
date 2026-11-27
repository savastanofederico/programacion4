# Food Store — Sistema de Pedidos de Comida

Trabajo Práctico Integrador de **Programación 4** (Tecnicatura Universitaria en Programación a Distancia — UTN).

- **Alumno:** Federico Savastano
- **Repositorio GitHub:** https://github.com/savastanofederico/programacion4
- **Video de demostración:** https://youtu.be/Rmr9L_pfO6U

---

## Requisitos previos

- **Python** 3.11 a 3.13 (SQLModel 0.0.22 no funciona con Python 3.14)
- **PostgreSQL** 15 o superior (para desarrollo local también se puede usar SQLite cambiando `DATABASE_URL`)
- **Node.js** 20.19 o superior
- **pnpm** 9 o superior

---

## Estructura del proyecto

```
backend/    API REST con FastAPI + SQLModel
frontend/   Aplicación React + TypeScript (Vite)
README.md
```

- `backend/`: arquitectura por dominios (`auth`, `usuarios`, `categorias`, `productos`, `pedidos`). Cada módulo tiene Router, Service, Unit of Work, Repository, Models y Schemas; `auth` solo tiene router, service y schemas porque usa el modelo `Usuario`. La infraestructura compartida está en `app/core/` (configuración, base de datos, seguridad, dependencias, `UnitOfWork` y `BaseRepository`).
- `frontend/`: organizado por features (`auth`, `categorias`, `productos`, `pedidos`, `usuarios`), con `shared/` para lo transversal, `store/` para Zustand y `routes/` para las rutas. Usa Tailwind CSS 4, Axios (`withCredentials`), TanStack Query, TanStack Form, TanStack Table, Zustand (`persist`) y React Router.

---

## Usuario administrador (seed)

El seed es idempotente: se puede correr varias veces sin duplicar datos. Crea el usuario administrador, 4 categorías y 8 productos con stock.

| Usuario | Contraseña | Rol |
| --- | --- | --- |
| `admin` | `Admin1234!` | `admin` |

Los clientes se crean desde la pantalla de registro (rol `user`).

---

## Variables de entorno

### Backend (`backend/.env`)

| Variable | Descripción | Valor de ejemplo |
| --- | --- | --- |
| `DATABASE_URL` | Conexión a la base de datos | `postgresql://postgres:postgres@localhost:5432/foodstore_tpi_db` |
| `SECRET_KEY` | Clave para firmar el JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres-segura` |
| `ALGORITHM` | Algoritmo del JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token y de la cookie (minutos) | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS | `http://localhost:5173` |

Para usar SQLite en lugar de PostgreSQL: `DATABASE_URL=sqlite:///./foodstore.db`

### Frontend (`frontend/.env`)

| Variable | Descripción | Valor de ejemplo |
| --- | --- | --- |
| `VITE_API_URL` | URL base de la API | `http://localhost:8000/api/v1` |

---

## Instalación y ejecución

### 1. Base de datos

Crear la base de datos en PostgreSQL:

```bash
createdb -U postgres foodstore_tpi_db
```

Si se usa SQLite este paso no hace falta (el archivo se crea solo al correr el seed).

### 2. Backend

```bash
cd backend
python3 -m venv .venv          # si python3 es 3.14, usar python3.13 -m venv .venv
source .venv/bin/activate      # en Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m app.db.seed
uvicorn app.main:app --reload
```

- API: http://localhost:8000/api/v1
- Documentación: http://localhost:8000/docs y http://localhost:8000/redoc

### 3. Frontend

En otra terminal, desde la raíz del proyecto:

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm build
pnpm dev
```

- Aplicación: http://localhost:5173

`pnpm build` compila y verifica los tipos; para usar la app alcanza con `pnpm dev`.

---

## Funcionalidades principales

**Cliente (rol `user`)**
- Registro e inicio de sesión (JWT en cookie HttpOnly).
- Catálogo con búsqueda, filtro por categoría y paginación en el servidor.
- Carrito persistido en el navegador.
- Checkout con dirección de entrega, forma de pago (efectivo o transferencia) y notas.
- Mis pedidos: detalle y cancelación mientras el pedido está en `PENDIENTE` (se restituye el stock).

**Administrador (rol `admin`)**
- Resumen con indicadores (pedidos por estado, pedidos de hoy e ingresos de pedidos entregados).
- ABM de categorías y productos, cambio de stock y disponibilidad (baja lógica).
- Gestión de pedidos: `PENDIENTE → EN_PREPARACION → ENTREGADO`, o `CANCELADO` desde cualquier estado no terminal.
- Gestión de usuarios: activar y desactivar cuentas (el admin no puede desactivarse a sí mismo).
