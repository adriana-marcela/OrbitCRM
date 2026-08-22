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

Este repositorio se comparte como **proyecto académico / de portafolio**. El proyecto incluye un usuario y datos de muestra 100% ficticios para que cualquiera pueda explorarlo sin riesgo.

## 🧪 Prueba el CRM (usuario demo)

Puedes iniciar sesión con un usuario de **solo lectura**, para que puedas navegar por
los módulos autorizados sin poder crear, editar ni borrar la información de muestra:

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

# Crea el entorno virtual en tu carpeta
python -m venv venv
#Activa el entorno virtual 
venv\Scripts\Activate.ps1      # En Windows (PowerShell)
# source venv/bin/activate     # En macOS/Linux

#Instala las bibliotecas y paquetes externos
pip install -r requirements.txt

#Instala las migraciones
python manage.py migrate

#Ejecuta el backend 
python manage.py runserver

# Nota adicional: comandos utiles 
# para desactivar el entono virtual 
deactivate 
#Para limpiar la consola
cls 

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
