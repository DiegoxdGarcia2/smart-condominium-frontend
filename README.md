## Minimal UI ([Free version](https://free.minimals.cc/))

![license](https://img.shields.io/badge/license-MIT-blue.svg)

![preview](public/assets/images/minimal-free-preview.jpg)

> Free React Admin Dashboard made with Material-UI components and React + Vite.js.

## Pages

- [Dashboard](https://free.minimals.cc/)
- [Users](https://free.minimals.cc/user)
- [Products](https://free.minimals.cc/products)
- [Blog](https://free.minimals.cc/blog)
- [Sign in](https://free.minimals.cc/sign-in)
- [Not found](https://free.minimals.cc/404)

## Quick start

- Clone the repo: `git clone https://github.com/minimal-ui-kit/material-kit-react.git`
- Recommended: `Node.js v20.x`
- **Install:** `npm i` or `yarn install`
- **Start:** `npm run dev` or `yarn dev`
- **Build:** `npm run build` or `yarn build`
- Open browser: `http://localhost:3039`

## Backend API configuration

This project reads the backend base URL from the Vite environment variable `VITE_API_BASE_URL`.

1. Copy `.env.example` to `.env` at the project root:

	- On Windows PowerShell: `cp .env.example .env`

2. Edit `.env` and set `VITE_API_BASE_URL` to your backend address. Example value used during development:

	VITE_API_BASE_URL=https://smart-condominium-backend-fuab.onrender.com

Note: `.env` is ignored by git (see `.gitignore`). We provide `.env.example` so each developer can configure their own local backend without committing secrets.

## Pasarela de pagos (integración)

Este repo incluye componentes para una pestaña de "Pasarela de pagos" usando el backend desplegado en Render y Stripe Checkout.

Dependencias necesarias:

- axios
- @mui/material @mui/icons-material @emotion/react @emotion/styled
- (opcional) @mui/x-data-grid

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


## Upgrade to PRO Version

| Minimal Free                | [Minimal Pro](https://material-ui.com/store/items/minimal-dashboard/)                                   |
| :-------------------------- | :------------------------------------------------------------------------------------------------------ |
| **6** Pages                 | **70+** Pages                                                                                           |
| **Partial** theme customize | **Fully** theme customize                                                                               |
| -                           | **Next.js** version                                                                                     |
| -                           | **TypeScript** version (Standard Plus and Extended license)                                             |
| -                           | Design **Figma** file (Standard Plus and Extended license)                                              |
| -                           | Authentication with **Amplify**, **Auth0**, **JWT**, **Firebase** and **Supabase**                      |
| -                           | Light/dark mode, right-to-left, form validation... ([+more components](https://minimals.cc/components)) |
| -                           | Complete users flows                                                                                    |
| -                           | 1 year of free updates / 6 months of technical support                                                  |
| -                           | Learn more: [Package & license](https://docs.minimals.cc/package)                                       |

## License

Distributed under the [MIT](https://github.com/minimal-ui-kit/minimal.free/blob/main/LICENSE.md) license.

## Contact us

Email: support@minimals.cc
