# PG Explorer — Vercel + PostgreSQL

Proyecto mínimo para conectar Vercel a una base de datos PostgreSQL y explorar sus tablas desde el browser.

## Estructura

```
proyecto-vercel/
├── api/
│   └── datos.js        ← Serverless function (backend)
├── public/
│   └── index.html      ← Frontend
├── package.json
├── vercel.json
└── README.md
```

## Variables de entorno requeridas

Configurarlas en **Vercel → Settings → Environment Variables**:

| Variable      | Descripción              |
|---------------|--------------------------|
| `PG_USER`     | Usuario de PostgreSQL    |
| `PG_DATABASE` | Nombre de la base        |
| `PG_PASSWORD` | Contraseña               |
| `PG_HOST`     | Host (default: 185.139.1.178) |
| `PG_PORT`     | Puerto (default: 5432)   |

## Deploy

1. Subir este proyecto a un repositorio de GitHub
2. Importar el repo en [vercel.com](https://vercel.com)
3. Configurar las variables de entorno
4. Hacer deploy → listo 🚀

## Cómo funciona

- `GET /api/datos` → lista todas las tablas y muestra los primeros 10 registros de la primera
- `GET /api/datos?tabla=nombre_tabla` → muestra los primeros 10 registros de esa tabla
- El frontend consume la API y muestra todo en una interfaz interactiva
