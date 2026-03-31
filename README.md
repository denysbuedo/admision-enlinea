# 🎓 Admisión en Línea (GradCall)

Plataforma integral de gestión de admisiones académicas para programas de postgrado. Conecta universidades con aspirantes mediante un proceso de aplicación estandarizado y profesional.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-latest-fbf0df?logo=bun)](https://bun.sh/)

---

## 📖 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Variables de Entorno](#-variables-de-entorno)
- [Comandos Disponibles](#-comandos-disponibles)
- [Hoja de Ruta](#-hoja-de-ruta)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 📋 Descripción

**Admisión en Línea** es un sistema cloud de admisiones académicas diseñado para instituciones de educación superior que buscan digitalizar y optimizar su proceso de captación de estudiantes de postgrado.

### Problema que Resuelve

Las universidades enfrentan desafíos significativos en la gestión de procesos de admisión:
- 📝 Procesos manuales y descentralizados
- 🔄 Falta de estandarización en convocatorias
- 📊 Dificultad para tracking de aplicaciones
- 💬 Comunicación ineficiente con aspirantes
- 🔐 Gestión compleja de roles y permisos

### Solución

Una plataforma unificada que:
- ✅ Centraliza la gestión de convocatorias
- ✅ Estandariza el proceso de aplicación
- ✅ Automatiza notificaciones y seguimiento
- ✅ Proporciona dashboards por rol de usuario
- ✅ Exporta datos para análisis institucional

---

## ✨ Características

### Para Aspirantes
- 📋 Búsqueda y filtrado de programas de postgrado
- 📝 Formulario de aplicación unificado (6 secciones)
- 📊 Seguimiento del estado de aplicaciones en tiempo real
- 🔔 Notificaciones de cambios de estado
- 📁 Gestión de documentos adjuntos

### Para Universidades
- 🏛️ Creación y gestión de convocatorias (25+ campos)
- 👥 Revisión de aplicaciones recibidas
- 🔄 Flujo de estados personalizable
- 📤 Exportación de datos a CSV
- 📈 Dashboard de métricas por programa

### Para Administradores
- 👤 Gestión de usuarios y roles
- ✅ Aprobación/rechazo de programas
- 🌐 Vista global de todas las aplicaciones
- 📊 Exportación de datos institucionales
- 🔧 Configuración del sistema

### Flujo de Estados

**Programas:**
```
Borrador → Pendiente de Aprobación → Publicado → Cerrado
                                              ↓
                                         Rechazado
```

**Aplicaciones:**
```
Borrador → Enviado → En Revisión → Entrevista → Aprobado
                                        ↓
                                   Rechazado
                                   En Espera
```

---

## 🏗️ Arquitectura

### Diagrama de Roles

```
┌─────────────────────────────────────────────────────────┐
│                    Admisión en Línea                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────┐  │
│  │   Super     │    │  Universidad │    │ Aspirante │  │
│  │    Admin    │    │              │    │           │  │
│  ├─────────────┤    ├──────────────┤    ├───────────┤  │
│  │ • Gestionar │    │ • Crear      │    │ • Buscar  │  │
│  │   usuarios  │    │   programas  │    │   programas│ │
│  │ • Aprobar   │    │ • Revisar    │    │ • Aplicar │  │
│  │   programas │    │   aplicaciones│   │ • Tracking│  │
│  │ • Exportar  │    │ • Actualizar │    │ • Docs    │  │
│  │   datos     │    │   estados    │    │           │  │
│  └─────────────┘    └──────────────┘    └───────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Esquema de Base de Datos

| Tabla | Descripción |
|-------|-------------|
| `users` | Usuarios con autenticación JWT y roles |
| `universities` | Información de instituciones |
| `programs` | Convocatorias de postgrado (25+ campos) |
| `applications` | Aplicaciones de aspirantes |
| `documents` | Archivos adjuntos por aplicación |
| `notifications` | Notificaciones del sistema |
| `status_history` | Historial de cambios de estado |

---

## 🛠️ Tecnologías

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 16.1.3 | Framework React con App Router |
| React | 19.2.3 | Biblioteca de UI |
| TypeScript | 5.9.3 | Tipado estático |
| Tailwind CSS | 4.1.17 | Estilos utility-first |

### Backend & Datos
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js API Routes | - | Endpoints serverless |
| Drizzle ORM | 0.45.1 | ORM type-safe |
| SQLite | - | Base de datos embebida |

### Autenticación & Seguridad
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| bcryptjs | 3.0.3 | Hash de contraseñas |
| jsonwebtoken | 9.0.3 | Tokens JWT |

### Herramientas de Desarrollo
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Bun | Latest | Package manager & runtime |
| ESLint | 9.39.1 | Linting de código |
| Drizzle Kit | 0.31.9 | Migraciones de DB |

---

## 📦 Instalación

### Prerrequisitos

- [Bun](https://bun.sh/) instalado (`curl -fsSL https://bun.sh/install | bash`)
- Git para clonar el repositorio

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/denysbuedo/admision-enlinea.git
cd admision-enlinea
```

2. **Instalar dependencias**
```bash
bun install
```

3. **Generar migraciones de base de datos**
```bash
bun run db:generate
```

4. **Ejecutar migraciones**
```bash
bun run db:migrate
```

5. **Crear usuario administrador**
```bash
# Visitar la ruta una vez iniciado el servidor
GET /api/admin/seed
```

---

## 🚀 Uso

### Iniciar Servidor de Desarrollo

```bash
bun dev
```

El servidor se ejecutará en `http://localhost:3000`

### Credenciales de Administrador

| Email | Contraseña |
|-------|------------|
| `admin@gradcall.com` | `Admin123!` |

### Rutas Principales

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/login` | Inicio de sesión |
| `/register` | Registro de usuarios |
| `/programs` | Listado público de programas |
| `/dashboard` | Dashboard de aspirantes |
| `/university` | Dashboard de universidades |
| `/admin` | Dashboard de administrador |

---

## 📁 Estructura del Proyecto

```
admision-enlinea/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # Endpoints API
│   │   │   ├── admin/          # Administración
│   │   │   ├── applications/   # Gestión de aplicaciones
│   │   │   ├── auth/           # Autenticación
│   │   │   ├── notifications/  # Notificaciones
│   │   │   └── programs/       # Programas
│   │   ├── dashboard/          # Dashboard aspirantes
│   │   ├── university/         # Dashboard universidades
│   │   ├── admin/              # Dashboard admin
│   │   ├── programs/           # Páginas públicas
│   │   ├── globals.css         # Estilos globales
│   │   ├── layout.tsx          # Layout raíz
│   │   └── page.tsx            # Landing page
│   ├── db/                     # Base de datos
│   │   ├── migrations/         # Migraciones
│   │   ├── schema.ts           # Esquema Drizzle
│   │   └── index.ts            # Cliente DB
│   └── lib/                    # Utilidades
│       └── auth.ts             # Autenticación JWT
├── .kilocode/                  # Documentación y reglas
├── drizzle.config.ts           # Configuración Drizzle
├── package.json                # Dependencias
├── tsconfig.json               # Configuración TypeScript
└── README.md                   # Este archivo
```

---

## 🔐 Variables de Entorno

| Variable | Valor por Defecto | Descripción |
|----------|-------------------|-------------|
| `JWT_SECRET` | `gradcall-secret-key-2024` | Secreto para firmar tokens JWT |
| `NODE_ENV` | `development` | Entorno (production habilita cookies seguras) |

### Configurar Variables de Entorno

Crear archivo `.env.local` en la raíz:

```env
JWT_SECRET=tu_secreto_seguro_aqui
NODE_ENV=production
```

---

## 📜 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `bun install` | Instalar dependencias |
| `bun dev` | Iniciar servidor de desarrollo |
| `bun build` | Compilar para producción |
| `bun start` | Iniciar servidor de producción |
| `bun lint` | Ejecutar ESLint |
| `bun typecheck` | Verificación de tipos TypeScript |
| `bun run db:generate` | Generar migraciones de DB |
| `bun run db:migrate` | Ejecutar migraciones de DB |

---

## 🗺️ Hoja de Ruta

Para ver el plan detallado de evolución del proyecto, consulta [ROADMAP.md](./ROADMAP.md).

### Resumen de Fases

| Fase | Enfoque | Duración Estimada |
|------|---------|-------------------|
| **Fase 1** | Estabilización y Testing | 2-3 semanas |
| **Fase 2** | Características Core | 4-6 semanas |
| **Fase 3** | Integraciones | 3-4 semanas |
| **Fase 4** | Escalabilidad y Cloud | 4-5 semanas |
| **Fase 5** | IA y Analytics | 4-6 semanas |

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para detalles.

---

## 📞 Contacto

**Denys Buedo Hidalgo**  
📧 denys.buedo@gmail.com  
🐙 [@denysbuedo](https://github.com/denysbuedo)

---

<div align="center">

**⭐ Si este proyecto te es útil, por favor considera darle una estrella en GitHub!**

</div>
