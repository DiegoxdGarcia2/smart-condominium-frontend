# Smart Condominium - Frontend

![license](https://img.shields.io/badge/license-MIT-blue.svg)

Aplicación web frontend para la gestión inteligente de condominios, desarrollada con React, TypeScript, Material-UI y Vite.js.

## 🚀 Características Principales

### 👥 Gestión de Usuarios por Roles
- **Administrador**: Control total del condominio (finanzas, usuarios, unidades, áreas comunes)
- **Residente**: Gestión personal (pagos, reservas, vehículos, mascotas)
- **Guardia**: Control de acceso y registro de visitas

### 📊 Dashboards Personalizados
- Dashboard administrativo con KPIs financieros y operativos
- Dashboard de residente con estado de pagos y reservas
- Dashboard de guardia con métricas de seguridad y tareas

### 💰 Sistema de Pagos Integrado
- Integración completa con Stripe Checkout
- Gestión de cuotas de mantenimiento y pagos pendientes
- Confirmación automática de transacciones

### 🏢 Gestión de Condominio
- **Finanzas**: Seguimiento de ingresos, cuotas y pagos
- **Usuarios**: Administración de residentes y roles
- **Unidades**: Gestión de propiedades del condominio
- **Áreas Comunes**: Reservas de espacios compartidos
- **Registro de Visitas**: Control de acceso de visitantes
- **Tareas**: Asignación y seguimiento de tareas de mantenimiento

### 📱 Funcionalidades Adicionales
- **Comunicados**: Sistema de anuncios y notificaciones
- **Reservas**: Gestión de espacios comunes
- **Vehículos y Mascotas**: Registro de bienes personales
- **Feedback**: Sistema de retroalimentación

## 🛠️ Tecnologías Utilizadas

- **Frontend Framework**: React 18 con TypeScript
- **Build Tool**: Vite.js
- **UI Library**: Material-UI (MUI) v6
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Icons**: Iconify (Solar icon set)
- **Charts**: Custom components con ApexCharts
- **Payments**: Stripe Checkout integration

## 📋 Prerrequisitos

- Node.js v20.x o superior
- npm o yarn
- Backend API corriendo (ver repositorio backend)

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/DiegoxdGarcia2/smart-condominium-frontend.git
cd smart-condominium-frontend
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

Edita `.env` con tus configuraciones:
```env
# URL del backend API
VITE_API_BASE_URL=https://smart-condominium-backend-fuab.onrender.com

# URL del frontend (para redirecciones de pago)
VITE_FRONTEND_BASE_URL=https://smart-condominium-frontend.vercel.app
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3039`

## 📁 Estructura del Proyecto

```
src/
├── app.tsx                 # Punto de entrada principal
├── main.tsx               # Renderizado de React
├── config-global.ts       # Configuración global
├── global.css            # Estilos globales
├── vite-env.d.ts         # Tipos de Vite
├── _mock/                # Datos de prueba
├── components/           # Componentes reutilizables
│   ├── chart/           # Componentes de gráficos
│   ├── color-utils/     # Utilidades de color
│   ├── iconify/         # Componentes de iconos
│   ├── label/           # Etiquetas y badges
│   ├── logo/            # Logo del proyecto
│   ├── scrollbar/       # Scrollbar personalizado
│   └── svg-color/       # Colores SVG
├── context/             # Context API (AuthContext)
├── layouts/             # Layouts de la aplicación
│   ├── dashboard/       # Layout principal del dashboard
│   └── nav-config-*/    # Configuración de navegación
├── pages/               # Páginas principales
│   ├── account.tsx      # Página de cuenta personal
│   ├── announcements.tsx # Comunicados
│   ├── dashboard.tsx    # Dashboard principal
│   ├── finances.tsx     # Finanzas
│   ├── guard-dashboard.tsx # Dashboard de guardia
│   ├── payment-method.tsx # Método de pago
│   ├── resident-dashboard.tsx # Dashboard de residente
│   ├── sign-in.tsx      # Inicio de sesión
│   └── page-not-found.tsx # Página 404
├── routes/              # Configuración de rutas
├── sections/            # Secciones de la aplicación
│   ├── account/         # Gestión de cuenta personal
│   ├── announcements/   # Comunicados
│   ├── common-areas/    # Áreas comunes
│   ├── feedback/        # Sistema de feedback
│   ├── finances/        # Finanzas
│   ├── overview/        # Dashboards
│   ├── reservations/    # Reservas
│   ├── tasks/           # Tareas
│   ├── units/           # Unidades
│   ├── users/           # Gestión de usuarios
│   └── visitor-log/     # Registro de visitas
├── services/            # Servicios API
├── theme/               # Tema y configuración visual
├── types/               # Definiciones TypeScript
└── utils/               # Utilidades
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run start        # Vista previa de producción

# Construcción
npm run build        # Construir para producción
npm run preview      # Vista previa del build

# Calidad de código
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Corregir errores de ESLint
npm run fm:check     # Verificar formato con Prettier
npm run fm:fix       # Corregir formato con Prettier
npm run fix:all      # Corregir linting y formato
```

## 🔐 Autenticación

La aplicación utiliza JWT (JSON Web Tokens) para autenticación:

1. **Inicio de sesión**: `POST /api/token/`
2. **Refresh token**: `POST /api/token/refresh/`
3. Los tokens se almacenan en localStorage
4. Axios interceptors manejan automáticamente la autenticación

## 💳 Integración de Pagos

### Configuración de Stripe
1. Obtén tus claves de Stripe (modo test para desarrollo)
2. Configura webhooks en el backend para eventos de pago
3. Las URLs de éxito/error se configuran automáticamente

### Flujo de Pago
1. Usuario selecciona cuota a pagar
2. Frontend solicita sesión de pago al backend
3. Backend crea sesión de Stripe Checkout
4. Usuario es redirigido a Stripe para completar pago
5. Después del pago, redirección automática a página de éxito
6. Backend confirma transacción vía webhook

### Tarjetas de Prueba (Stripe Test Mode)
- **Número**: 4242 4242 4242 4242
- **Fecha**: Cualquier fecha futura
- **CVC**: Cualquier 3 dígitos

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conecta tu repositorio de GitHub a Vercel
2. Configura las variables de entorno:
   - `VITE_API_BASE_URL`: URL de tu backend en producción
   - `VITE_FRONTEND_BASE_URL`: URL de tu frontend en Vercel
3. Despliega automáticamente con cada push a main

### Build Manual
```bash
npm run build
```

Los archivos optimizados se generan en la carpeta `dist/`.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE.md` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, por favor contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para la gestión inteligente de condominios**

Instalación:

```bash
npm install axios @mui/material @mui/icons-material @emotion/react @emotion/styled
```

Variables de entorno (añadir en `.env`):

- VITE_API_BASE_URL=https://smart-condominium-backend-fuab.onrender.com
- VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (opcional si usas Elements)

Archivos añadidos:

- `src/utils/api.js` — instancia central de axios con interceptor de Authorization.
- `src/hooks/useAuth.js` — hook mínimo para obtener el `access_token` desde localStorage.
- `src/components/payments/PaymentTab.jsx` — componente principal para listar pagos e iniciar checkout.
- `src/components/payments/PaymentSuccess.jsx` — ruta de callback que hace polling para confirmar transacción.

Uso rápido:

1. Asegúrate de tener `access_token` en localStorage (ejecuta el login contra `POST /api/token/` y guarda `access_token`).
2. Importa y monta `PaymentTab` dentro de la vista `Finanzas`.
3. Añade una ruta para `PaymentSuccess` en tu router, por ejemplo:

```jsx
// en src/routes/...
import PaymentSuccess from 'src/components/payments/PaymentSuccess';

// <Route path="/payment-success" element={<PaymentSuccess />} />
```

Ejemplos de requests y respuestas:

1) Obtener token
POST /api/token/
Body:
{
	"email": "admin@test.com",
	"password": "admin123"
}
Response 200:
{
	"refresh": "...",
	"access": "eyJ..."
}

2) Iniciar pago
POST /api/administration/initiate-payment/
Headers: Authorization: Bearer <access>
Body: { "financial_fee_id": 1 }
Response 201:
{
	"payment_url": "https://checkout.stripe.com/...",
	"transaction_id": "cs_test_..."
}

3) Listar pagos
GET /api/administration/payments/
Headers: Authorization: Bearer <access>
Response 200:
{
	"count": 1,
	"next": null,
	"previous": null,
	"results": [
		{
			"id": 8,
			"financial_fee": 1,
			"fee_description": "Cuota de mantenimiento - Septiembre 2025",
			"fee_amount": "1500.00",
			"resident_name": "Test User",
			"transaction_id": "cs_test_...",
			"amount": "1500.00",
			"status": "Pendiente",
			"payment_method": "",
			"gateway_response": { "stripe_session_id": "cs_test_..." },
			"created_at": "2025-09-23T19:41:07.492280Z",
			"processed_at": null
		}
	]
}

Pruebas manuales con Stripe (modo Test):

1. Inicia sesión en Stripe Dashboard (Test).
2. En Developers > Webhooks, asegúrate que el backend reciba `checkout.session.completed` y devuelve 2xx.
3. Usa tarjeta de prueba: 4242 4242 4242 4242, exp 12/34, CVC 123.
4. Inicia un pago desde `PaymentTab` y completa el checkout.
5. Serás redirigido a `/payment-success?session_id=cs_test_...`.
6. `PaymentSuccess` hará polling a `GET /api/administration/payments/` hasta que el backend marque la transacción como completada.

Notas de seguridad:

- No incluir claves secretas en el cliente.
- Valida y verifica las firmas de webhook en el backend con `STRIPE_WEBHOOK_SECRET`.
- Considera usar HttpOnly cookies para tokens si necesitas mayor seguridad.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE.md` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto, por favor contacta al equipo de desarrollo.

---

**Desarrollado con ❤️ para la gestión inteligente de condominios**
