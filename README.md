<h1 align="center">🪐 OrbitCRM</h1>

<p align="center">
  Proyecto académico — Sistema CRM full-stack (Angular 18 + Django REST Framework)
</p>

<p align="center">
  <img src="frontend/src/assets/img/orbitCRM.png" width="420" alt="OrbitCRM"/>
</p>

## 🔎 Sobre el proyecto

OrbitCRM es un sistema de gestión de relaciones con clientes (CRM) full-stack, pensado
para optimizar los procesos empresariales y fortalecer las interacciones con los
clientes: seguimiento de clientes, servicios contratados, historial de pagos, agenda,
chat interno y roles/permisos por usuario.

Este repositorio se comparte como **proyecto académico / de portafolio**. Los datos
reales del cliente original fueron eliminados; el proyecto incluye un usuario y datos
de muestra 100% ficticios para que cualquiera pueda explorarlo sin riesgo.

## 🧪 Prueba el CRM (usuario demo)

Puedes iniciar sesión con un usuario de **solo lectura**, para que puedas navegar por
todos los módulos sin poder crear, editar ni borrar la información de muestra:

```
Correo:      demo@orbitcrm.com
Contraseña:  Demo2025!
```

> Este usuario tiene rol "Colaborador" con permisos limitados a solo consulta (ver
> sección de backend para más detalle sobre el sistema de roles).

## 🛠️ Tech stack

- **Frontend:** Angular 18, Angular Material
- **Backend:** Django 5 + Django REST Framework, JWT (SimpleJWT)
- **Base de datos:** PostgreSQL
- **Almacenamiento de archivos:** AWS S3 (opcional, vía `django-storages`)

## 🚀 Cómo correr el proyecto localmente

### 1. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\Activate.ps1      # En Windows (PowerShell)
# source venv/bin/activate     # En macOS/Linux

pip install -r requirements.txt
```

Copia `.env.example` como `.env` dentro de `backend/src/` y completa tus propios
valores (ver detalle en [`backend/README.md`](backend/README.md)).

```bash
python manage.py migrate
python manage.py create_rol_and_permissions   # crea roles y permisos base
python manage.py seed_demo_data                # crea el usuario y datos demo
python manage.py runserver
```

### 2. Frontend

```bash
cd frontend
npm install
ng serve
```

La app quedará disponible en `http://localhost:4200`, conectada al backend en
`http://127.0.0.1:8000`.

## 📄 Licencia / uso

Proyecto con fines educativos y de portafolio. No usar datos ni credenciales reales.
