# Cuarto Avance Proyecto GratiDay - Guía de Pruebas

Plataforma web completa para gestionar frases de gratitud, categorías y usuarios, desarrollada con arquitectura REST API en el backend y Micro-Frontends (Web Components) en el frontend.

## Características Principales

### Backend (API REST)
- Autenticación JWT (JSON Web Tokens)
- Control de acceso basado en roles (RBAC)
- Operaciones CRUD completas para todas las entidades
- Publicación automática de frases programadas (scheduler)
- Validación de datos y manejo de errores
- CORS configurado para comunicación con frontend

### Frontend (Micro-Frontends)
- Arquitectura de Web Components (Micro-Frontends)
- Interfaz de usuario moderna y responsiva
- Integración completa con API REST
- Autenticación y gestión de sesión
- Control de acceso según roles de usuario
- Generación de imágenes con Canvas API
- Compartir frases (Clipboard API, Web Share API)

### APIs de HTML5 Utilizadas
- Fetch API: Maneja todas las peticiones CRUD al backend, incluyendo el JWT.
- Canvas API: Genera imágenes 1200×630 con diseño, texto y marca de agua.
- Clipboard API: Copia las imágenes generadas al portapapeles.
- Web Share API: Comparte imágenes mediante el menú nativo del dispositivo.

## Instalación

### 1. Clonar o descargar el proyecto

```bash
cd NombreCarpetaProyecto
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar la base de datos

#### 3.1. Crear la base de datos

Ejecuta el script SQL en MySQL:`database/database.sql`

#### 3.2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=gratiday
DB_CHARSET=utf8mb4

# JWT
SECRET_KEY=tu_secreto_jwt_seguro

# Servidor
PORT=3000
NODE_ENV=desarrollo
```

### 4. Poblar la base de datos (opcional)

```bash
npm run seed
```

Esto creará usuarios de prueba con contraseñas hasheadas.

## Uso

### Iniciar el Backend

```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## Iniciar el Frontend

### Paso 1: Asegurar que el Backend esté corriendo

```bash
cd "NombreCarpetaProyecto"
npm start
```

El servidor debe estar en `http://localhost:3000`

### Paso 2: Abrir el Frontend

**Servidor Node.js Simple**

```bash
# Instala http-server globalmente
npm install -g http-server

# En la carpeta frontend
cd frontend
http-server -p 8080
```

### Paso 3: Probar Funcionalidades

#### 1. Autenticación
- **Login**: Usa `juan@example.com` / `password123`
- **Register**: Crea un nuevo usuario
- Verifica que el token se guarde y el navbar muestre tu nombre

#### 2. Frases (CRUD Completo)
- **Crear**: Click en "➕ Nueva Frase"
- **Leer**: Ver lista de frases con filtros
- **Actualizar**: Click en "✏️ Editar" en cualquier frase
- **Eliminar**: Click en "🗑️ Eliminar" (con confirmación)
- **Publicar/Borrador**: Cambiar estados de frases

#### 3. Categorías (CRUD Completo)
- **Crear**: Click en "➕ Nueva Categoría"
- **Leer**: Ver lista de categorías
- **Actualizar**: Click en "✏️ Editar"
- **Eliminar**: Click en "🗑️ Eliminar"

#### 4. Usuarios (CRUD Completo)
- **Crear**: Click en "➕ Nuevo Usuario"
- **Leer**: Ver lista de usuarios
- **Actualizar**: Click en "✏️ Editar"
- **Eliminar**: Click en "🗑️ Eliminar"

#### 5. Responsive Design
- Redimensionar la ventana del navegador
- Verificar que todo se adapte correctamente
- Probar en móvil (DevTools → Toggle device toolbar)

#### 6. Web Components
- Abrir DevTools → Elements
- Verificar que los componentes custom aparecen:
  - `<gratiday-navbar>`
  - `<gratiday-login>`
  - `<gratiday-frase-list>`
  - `<gratiday-categoria-list>`
  - `<gratiday-usuario-list>`

###  Solución de Problemas

**Error: CORS**
- El backend debe permitir CORS desde `http://localhost:8080`
- Verificar que el servidor esté corriendo en el puerto correcto

**Error: Token inválido**
- Hacer logout y login nuevamente
- Verificar en DevTools → Network que las peticiones incluyan el header `Authorization: Bearer <token>`

**No se cargan datos**
- Abrir DevTools → Console para ver errores
- Verificar la conexión con el backend
- Revisar que la URL de la API sea correcta


