# Food Store — Sistema de Pedidos de Comida

Trabajo Práctico Integrador de **Programación 4** (Tecnicatura Universitaria en Programación a Distancia — UTN).

- **Repositorio GitHub:** https://github.com/savastanofederico/programacion4
- **Video de demostración:** 

---

## Requisitos previos

- **Python** 3.11 a 3.13 (requerido por SQLModel 0.0.22 y bcrypt 4.0.1)
- **PostgreSQL** 15 o superior (para desarrollo local también se puede usar SQLite cambiando `DATABASE_URL`)
- **Node.js** 20.19 o superior
- **pnpm** 9 o superior

---

## Estructura del proyecto

- `backend/`: API REST en FastAPI + SQLModel con arquitectura por dominios (Router, Service, Unit of Work, Repository, Models y Schemas), autenticación JWT en cookie HttpOnly y autorización por roles.
- `frontend/`: Aplicación React + TypeScript (`strict: true`) organizada por features, con Vite, Tailwind CSS 4, Axios (`withCredentials`), TanStack Query, TanStack Form, TanStack Table, Zustand (`persist`) y React Router.

---

## Credenciales iniciales (Seed)

Al ejecutar el seed idempotente se crea el usuario administrador, 4 categorías y 8 productos con stock:

- **Usuario:** `admin`
- **Contraseña:** `Food9899@`
- **Rol:** `admin`

---

## Variables de entorno

### Backend (`backend/.env.example`)

| Variable | Descripción | Valor de ejemplo |
| --- | --- | --- |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL o SQLite | `postgresql://postgres:postgres@localhost:5432/foodstore_tpi_db` |
| `SECRET_KEY` | Clave secreta para firmar el JWT (mínimo 32 caracteres) | `cambiar-esta-clave-de-al-menos-32-caracteres-segura` |
| `ALGORITHM` | Algoritmo de firma JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración del token y de la cookie en minutos | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por CORS con credenciales | `http://localhost:5173` |

### Frontend (`frontend/.env.example`)

| Variable | Descripción | Valor de ejemplo |
| --- | --- | --- |
| `VITE_API_URL` | URL base de la API REST del backend | `http://localhost:8000/api/v1` |

---

## Instalación y ejecución

### 1. Base de datos (PostgreSQL)

Crear la base de datos antes de iniciar el backend:

```bash
createdb -U postgres foodstore_tpi_db
```
### 2. Backend:
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python -m app.db.seed
uvicorn app.main:app --reload
```
- API disponible en: http://localhost:8000/api/v1

- Documentación OpenAPI: http://localhost:8000/docs y http://localhost:8000/redoc

### 3. Frontend:
En otra terminal desde la raíz del proyecto:
```bash
cd frontend
cp .env.example .env
pnpm install
pnpm build
pnpm dev
```

Aplicación disponible en: http://localhost:5173