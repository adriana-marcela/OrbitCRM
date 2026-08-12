<h2 align="center">💻 OrbitCRM — Backend</h2>

API REST construida con Django 5 y Django REST Framework, con autenticación JWT
(`djangorestframework-simplejwt`) y un sistema de roles y permisos personalizado.

## Variables de entorno

Copia `.env.example` como `.env` dentro de `backend/src/` y completa tus valores:

| Variable | Descripción |
|---|---|
| `SECRET_KEY` | Clave secreta de Django (usa una distinta a la de ejemplo si vas a exponer el proyecto) |
| `DEBUG` | `True` en desarrollo, `False` en producción |
| `ALLOWED_HOSTS` | Hosts permitidos, separados por coma |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL (formato `postgres://usuario:password@host:puerto/nombre_bd`) |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_STORAGE_BUCKET_NAME` / `AWS_S3_REGION_NAME` | Credenciales de S3 (opcional, para fotos/documentos) |
| `DEFAULT_FROM_EMAIL` / `NOTIF_FROM_EMAIL` / `EMAIL_HOST_USER` / `EMAIL_HOST_PASSWORD` | Envío de correos (recuperación de contraseña, notificaciones) |

## Puesta en marcha

```bash
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt

python manage.py migrate
python manage.py create_rol_and_permissions
python manage.py seed_demo_data
python manage.py runserver
```

## Sistema de roles y permisos

Los permisos se generan automáticamente por modelo y acción (`view_`, `add_`,
`change_`, `delete_` + nombre del modelo) mediante el comando
`create_rol_and_permissions`. Los roles base son:

- **Super Admin** — todos los permisos.
- **Admin** — todos los permisos excepto eliminar.
- **Colaborador** — solo lectura (`view_*`). Es el rol que usa el usuario demo.
- **Cliente** / **Cliente Aux** — acceso limitado a su propia información.

## Comandos de gestión útiles

| Comando | Qué hace |
|---|---|
| `create_rol_and_permissions` | Crea los roles y permisos base del sistema (correr una sola vez, es idempotente). |
| `create_owner_account` | Crea o actualiza **tu** cuenta personal con rol Super Admin (acceso total: crear, editar y eliminar). Uso: `python manage.py create_owner_account --email tu@correo.com --password TuContraseñaSegura` (si omites `--password`, te la pide oculta por consola). |
| `seed_demo_data` | Crea el usuario `demo@orbitcrm.com` (rol Colaborador, solo lectura) y clientes/servicios/pagos ficticios para poder explorar el CRM. |
| `create_user_for_client` | Crea usuarios para clientes existentes que aún no tengan uno asociado. |
| `check_birthdays` | Genera notificaciones de cumpleaños próximos/del día. |
