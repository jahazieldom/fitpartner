Objetivo
Permitir a un gimnasio ofrecer a sus clientes una experiencia moderna y funcional para reservar, asistir y comunicarse respecto a sus clases, con control administrativo completo desde el backend.

📦 Módulos y funcionalidades
1. 👩‍🏫 Catálogo de Instructores
CRUD básico: nombre, foto, contacto, biografía.

Asignación de clases.

Acceso a bandeja de mensajes y reportes de asistencia.

2. 🏋️‍♀️ Catálogo de Clases
Nombre, descripción, instructor asignado, duración.

Horarios semanales (ej. Lunes y Miércoles 7:00 AM).

Capacidad máxima (cupo limitado).

Estado activo/inactivo.

3. 👤 Catálogo de Clientes
Nombre, correo, teléfono.

Acceso vía app móvil (login).

Historial de clases reservadas y asistencias.

4. 📅 Reservación de Clases (cliente desde app)
Visualización de clases disponibles por día/semana.

Reservar cupo si hay disponibilidad.

Cancelación (reglas configurables).

Verificación de asistencia mediante QR.

5. ✅ Registro de Asistencias (admin o instructor)
Lista de asistencia para cada clase.

Escaneo de código QR por parte del instructor o kiosco.

Marca automática de asistencia al escanear.

Alternativamente, registro manual.

6. 💬 Módulo de Chat Cliente ↔ Instructor
Envío de mensajes desde app cliente al instructor.

Inbox para el instructor en el backend.

(Push o correo en segundo plano para alertar de mensajes nuevos).

7. 📲 Notificaciones (correo/push)
Confirmación de reservación o cancelación.

Recordatorio de clase próxima (opcional).

Notificación de mensaje nuevo.

Notificación de apertura de cupo (opcional).

8. 📊 Reportes y KPIs (Admin)
Total de asistencias por clase/instructor.

Tasa de asistencia vs reservación.

Clases más concurridas.

Actividad reciente de clientes.

Exportación a Excel (mínimo).

📱 App Móvil para Clientes (Cross-platform)
Elemento	Detalles
Tecnología	React Native (offline-ready si es necesario)
Funciones clave	Login, lista de clases, reservación, código QR, chat
Almacenamiento	SQLite + sincronización vía API
Notificaciones	Firebase Cloud Messaging (FCM) para push
Escáner QR	Integrado con cámara usando react-native-camera o expo-camera

🔧 Stack sugerido (Web + Backend)
Componente	Tecnología
Backend	Django + Django REST Framework
DB	PostgreSQL
Frontend admin	Django + Tabler CSS (o HTMX si aplica)
App cliente	React Native (Expo Managed Workflow)
Sincronización	API REST autenticada con JWT
Notificaciones	FCM (push) + SendGrid o SMTP (correo)
QR Asistencia	UUID único por clase/reservación

🔐 Seguridad mínima necesaria
Login con correo/contraseña (token JWT en app).

Permisos por rol (admin, instructor, cliente).

Expiración de códigos QR.

Prevención de sobrecupo.

CSRF, rate limit, validación de inputs.

🧪 ¿Qué se entrega en el MVP?
Web admin funcional (instructores, clases, asistencia, reportes, mensajes)

App móvil cliente (ver clases, reservar, chat, escanear QR)

Notificaciones básicas

Reportes gráficos y exportables

Capacidad de escalar a módulos como pagos, membresías, calificaciones