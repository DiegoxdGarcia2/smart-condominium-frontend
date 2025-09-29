# Fix PaymentTab.jsx — Prompt y documentación para Copilot

Objetivo

- Proveer a GitHub Copilot un documento único y completo con todo lo necesario para corregir `PaymentTab.jsx` (componente frontend) y dejar la integración con el endpoint `/api/administration/payments/initiate-payment/` funcionando desde la UI.

Resumen del problema

- Desde la UI (React + Vite + Material UI) al pulsar el botón de pago, la petición POST a `/api/administration/payments/initiate-payment/` falla con HTTP 400.
- Causas probables: falta de header Authorization, cuerpo mal formado (no enviar `financial_fee_id` como número en JSON), Content-Type incorrecto, o la UI no muestra el mensaje de error retornado por el backend.

Qué contiene este documento

1. Contexto rápido del backend y contract endpoint
2. Mensajes de error observados en pruebas
3. Requerimientos y criterios de aceptación
4. Reproducción y pasos de verificación (manual y scripts existentes)
5. Sugerencia de implementación (código completo de ejemplo para `PaymentTab.jsx`)
6. Prompt listo para pegar en Copilot (TODO: pegar directamente en la ventana de Copilot)

---

## 1) Contexto rápido (backend)

- API endpoint (backend): `POST /api/administration/payments/initiate-payment/`
- Autenticación: requiere JWT Bearer token (cabecera `Authorization: Bearer <access_token>`).
- Body esperado (JSON):
  - `financial_fee_id` (integer) — id de la cuota a pagar.

Respuestas importantes del endpoint:
- 201 CREATED
  - { "payment_url": "https://checkout.stripe.com/c/pay/cs_test_...", "transaction_id": "cs_test_..." }
  - Indica que se creó una sesión de Stripe. El frontend debe redirigir al `payment_url` (window.location.href).

- 400 BAD REQUEST (errores posibles):
  - { "error": "You did not provide an API key..." } — error del servidor cuando falta STRIPE_SECRET_KEY (ya corregido en producción).
  - { "error": "Ya existe una transacción pendiente para esta cuota" } — hay una transacción pendiente (UI debe mostrar el mensaje y/o redirigir a lista de pagos).
  - Otros: validación/serialización — backend devuelve JSON con clave `error` o `detail`.

- 401/403 — si falta Authorization o token inválido.

---

## 2) Mensajes de error observados en las pruebas (ejemplos reales)

- Token obtenido: HTTP 200 con `access` y `refresh` JWT.
- Inicio de sesión Stripe (antes de arreglos): 400 -> { "error": "You did not provide an API key..." }
- Después de arreglos: 201 -> { "payment_url": "https://checkout.stripe.com/c/pay/cs_test_...", "transaction_id":"cs_test_..." }
- Caso réplica en UI: 400 -> { "error": "Ya existe una transacción pendiente para esta cuota" }
- Webhook (para completado) exitoso: 200 -> { "message":"Pago procesado exitosamente","transaction_id":"cs_test_..." }

Coloca estos ejemplos en pruebas manuales para comprobar comportamiento.

---

## 3) Requerimientos para la corrección (especificación corta)

- Enviar la petición correctamente:
  - Header `Content-Type: application/json`.
  - Header `Authorization: Bearer <access_token>`; el token lo debe proveer el flujo de login y almacenarse en el estado/contexto o localStorage según la app.
  - Body JSON: { "financial_fee_id": Number(...) }
- UX:
  - Disable del botón mientras la petición esté en curso para evitar múltiples clicks.
  - Mostrar mensajes de backend (por ejemplo, `err.response.data.error` o `err.response.data.detail`) al usuario en un `Snackbar` o `Alert` de MUI.
  - Si el backend responde con `payment_url` y `transaction_id`, redirigir al `payment_url` (window.location.href = payment_url).
  - Si backend responde "Ya existe una transacción pendiente...", mostrar dicho mensaje y ofrecer link o redirección a la lista de pagos.
- Testing mínimo: happy-path (201 + redirección), error-path (400 con mensaje), auth missing (401) — mostrar instrucción clara al usuario.

---

## 4) Cómo reproducir / comandos útiles

- Scripts en el repositorio (backend) para pruebas programáticas:
  - `scripts/test_stripe_prod.py` — realiza: obtener JWT -> POST initiate-payment -> simular webhook.
  - `scripts/trigger_webhook_for_pending_tx.py` — busca transacción pendiente y envía webhook firmado.

- Pasos manuales (desde UI):
  1. Abrir la app frontend (en modo dev). Iniciar sesión y copiar `access_token` (si no hay flujo visible, revisar almacenamiento local o Redux/Context donde la app guarda el token).
  2. En la consola de devtools, observa la petición POST a `/api/administration/payments/initiate-payment/` y su response JSON.
  3. Confirmar headers y body: deben verse `Authorization` y `Content-Type: application/json` y body con `financial_fee_id` numérico.

---

## 5) Implementación sugerida — Componente ejemplo completo

- Este bloque es un ejemplo de `PaymentTab.jsx` (React functional component) que puedes usar directamente o pedirle a Copilot que genere una versión similar.

```jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material';

export default function PaymentTab({ financialFeeId, accessToken }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handlePay = async () => {
    if (!financialFeeId) {
      setMessage({ severity: 'error', text: 'No se encontró la cuota a pagar.' });
      return;
    }
    setLoading(true);
    try {
      const url = '/api/administration/payments/initiate-payment/';
      const body = { financial_fee_id: Number(financialFeeId) };
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };
      const resp = await axios.post(url, body, { headers });
      // Resp: { payment_url, transaction_id }
      if (resp.status === 201 && resp.data && resp.data.payment_url) {
        // redirigir a Stripe Checkout
        window.location.href = resp.data.payment_url;
      } else {
        setMessage({ severity: 'warning', text: 'Respuesta inesperada del servidor.' });
      }
    } catch (err) {
      // Manejo robusto de errores
      let text = 'Error en la petición.';
      if (err.response && err.response.data) {
        // Priorizar campos comunes devueltos por el backend
        text = err.response.data.error || err.response.data.detail || JSON.stringify(err.response.data);
      } else if (err.message) {
        text = err.message;
      }
      setMessage({ severity: 'error', text });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handlePay} disabled={loading}>
        {loading ? <CircularProgress size={20} /> : 'Pagar Ahora'}
      </Button>

      <Snackbar open={!!message} autoHideDuration={8000} onClose={() => setMessage(null)}>
        {message && <Alert onClose={() => setMessage(null)} severity={message.severity}>{message.text}</Alert>}
      </Snackbar>
    </div>
  );
}
```

Notas sobre el ejemplo:
- `financialFeeId` y `accessToken` deben provenir del contexto de la app (props, Redux, Context o localStorage).
- Ajusta la URL base si tu frontend usa un proxy o tiene prefijo (en dev, Vite permite `vite.config` proxy a `/api`).

---

## 6) Prompt listo para pegar en Copilot

Copia exactamente el siguiente texto y pégalo en Copilot (o en la extensión para que genere/reescriba `PaymentTab.jsx`). Si tu archivo real tiene otro path/nombre, reemplázalo en la instrucción.

> Fix / implement PaymentTab.jsx to correctly call the backend initiate-payment endpoint
>
> Context:
>
> - Frontend stack: React + Vite + Material UI
> - Backend: Django REST Framework (JWT via SimpleJWT)
> - Endpoint: POST /api/administration/payments/initiate-payment/
> - Expected request:
>   - Headers: Content-Type: application/json, Authorization: Bearer <access_token>
>   - Body JSON: { "financial_fee_id": Number }
> - Successful response: 201 { "payment_url": "https://checkout.stripe.com/c/pay/...", "transaction_id": "cs_test_..." }
> - Error responses to handle: 400 with { error: string } (for example "Ya existe una transacción pendiente para esta cuota"), 401, network errors.
>
> Requirements for Copilot:
>
> 1. Create or replace a React functional component `PaymentTab.jsx` which:
>    - Accepts props: `financialFeeId` (number or string) and `accessToken` (string). If your app uses context or Redux, add a TODO comment to wire the token retrieval.
>    - Sends a POST with JSON body { financial_fee_id: Number(financialFeeId) } to `/api/administration/payments/initiate-payment/`.
>    - Adds header `Authorization: Bearer ${accessToken}` and `Content-Type: application/json`.
>    - Disables the pay button while request is in-flight and shows a spinner.
>    - On success (201 + `payment_url`), redirects the browser to `payment_url`.
>    - On error, displays the backend message (err.response.data.error or err.response.data.detail) in a MUI Snackbar/Alert.
>
> 2. Include inline comments explaining where to plug token retrieval (if not passed via props).
>
> 3. Add basic defensive code for missing `financialFeeId`.
>
> 4. Add a small unit test or describe manual test steps: how to reproduce, how to check network headers, and which scripts (in repo) can validate the backend flow: `scripts/test_stripe_prod.py` and `scripts/trigger_webhook_for_pending_tx.py`.
>
> Provide the full component code, and in a short note mention acceptance criteria and test steps (happy path + 2 error cases). Do not change backend code.

---

## 7) Criterios de aceptación (qué comprobar luego)

- Desde la UI (con un `access_token` válido): al pulsar Pagar, la petición POST sale con headers correctos y body JSON correcto.
- En caso de 201, el usuario es redirigido a `payment_url`.
- En caso de error 400/401, el mensaje del backend se muestra al usuario en un `Snackbar`.
- El botón queda deshabilitado durante la petición para evitar múltiples transacciones.

---

## 8) Pasos siguientes sugeridos

- Pegar el prompt anterior en Copilot y aceptar la sugerencia o pedir refactorizaciones.
- Integrar el componente generado donde corresponda en la app y probar en dev.
- Ejecutar `scripts/test_stripe_prod.py` para validar el flujo contra el backend de pruebas/producción (según corresponda).

---

Si quieres, puedo:
- Ejecutar el cambio en el repo por ti (crear/editar `PaymentTab.jsx`) y correr una verificación rápida en local si me indicas dónde se guarda `accessToken` en el frontend.
- Ajustar el prompt para el path exacto del archivo frontend (p. ej. `src/components/Payments/PaymentTab.jsx`) si me das la ruta.

Fin del documento.
