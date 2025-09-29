import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Box, Card, Alert, Button, Snackbar, TextField, Typography, CardContent } from '@mui/material';

import { useAuth } from 'src/context/AuthContext';

export default function PaymentMethodPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const feeId = searchParams.get('fee_id');
  const { accessToken } = useAuth();

  const [cardNumber, setCardNumber] = useState('4242424242424242');
  const [exp, setExp] = useState('12/34');
  const [cvc, setCvc] = useState('123');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'info'|'error' }>(() => ({ open: false, message: '', severity: 'info' }));

  const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') || 'http://localhost:8000';
  const FRONTEND_BASE = (import.meta.env.VITE_FRONTEND_BASE_URL || '').replace(/\/$/, '') || 'http://localhost:3039';

  const closeSnackbar = () => setSnackbar(s => ({ ...s, open: false }));

  const handlePay = async () => {
    if (!feeId) {
      setSnackbar({ open: true, message: 'Falta el id de la cuota', severity: 'error' });
      return;
    }
    const token = accessToken ?? (localStorage.getItem('accessToken') as string | null);
    if (!token) {
      setSnackbar({ open: true, message: 'No autorizado', severity: 'error' });
      return;
    }

    try {
      // Try multiple payload shapes to be compatible with backend validation differences
      const candidatePayloads = [
        { financial_fee_id: Number(feeId) },
        { financial_fee: Number(feeId) },
        { fee_id: Number(feeId) },
        { id: Number(feeId) },
        { financialFee: Number(feeId) },
        // string forms
        { financial_fee_id: String(feeId) },
        { financial_fee: String(feeId) },
      ];

      const endpoints = [
        `${API_BASE}/api/administration/initiate-payment/`,
        `${API_BASE}/api/administration/payments/initiate_payment/`,
      ];

      let lastError: any = null;

      for (const ep of endpoints) {
        for (const payload of candidatePayloads) {
          try {
            console.debug('[PaymentMethod] trying initiate-payment', ep, payload);
            const res = await axios.post(ep, payload, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, timeout: 15000 });
            if (res.status === 201 || res.status === 200) {
              const data = res.data || {};
              const paymentUrl = data.payment_url;
              const tx = data.transaction_id || data.transaction || null;
              if (tx) try { localStorage.setItem('pendingPaymentSession', tx); } catch (err) { console.warn('[PaymentMethod] localStorage write failed', err); }
              if (paymentUrl) {
                window.location.href = paymentUrl;
                return;
              }
              if (tx) {
                window.location.href = `${FRONTEND_BASE}/payment-success?transaction_id=${encodeURIComponent(tx)}`;
                return;
              }
              setSnackbar({ open: true, message: 'Pago iniciado pero no se devolvió URL', severity: 'error' });
              return;
            }
              } catch (e: any) {
                lastError = e;
                // if backend says pending, break to fallback handling below
                const st = e?.response?.status as number | undefined;
                const msg = e?.response?.data?.error || e?.response?.data?.detail || (typeof e?.response?.data === 'string' ? e?.response?.data : undefined);
                if (st === 400 && msg && /pendiente/i.test(String(msg))) {
                  lastError = e;
                  break;
                }
                // otherwise try next payload
              }
        }
        // if lastError indicates pending, break endpoints loop
        if (lastError) {
          const st = lastError?.response?.status as number | undefined;
          const msg = lastError?.response?.data?.error || lastError?.response?.data?.detail || (typeof lastError?.response?.data === 'string' ? lastError?.response?.data : undefined);
          if (st === 400 && msg && /pendiente/i.test(String(msg))) break;
        }
      }

      // If we reach here there's an error or pending. If pending, handle like before
      if (lastError) {
        const st = lastError?.response?.status as number | undefined;
        const data = lastError?.response?.data;
        const backendMsg = data?.error || data?.detail || (typeof data === 'string' ? data : undefined) || lastError?.message;
        if (st === 400 && backendMsg && /pendiente/i.test(backendMsg)) {
          // try to find an existing transaction
          try {
            const listRes = await axios.get(`${API_BASE}/api/administration/payments/`, { headers: { Authorization: `Bearer ${token}` } });
            const items: any[] = Array.isArray(listRes.data) ? listRes.data : (listRes.data?.results || []);
            const extractFeeId = (it: any): number | null => {
              if (!it) return null;
              if (typeof it.financial_fee === 'number') return Number(it.financial_fee);
              if (typeof it.fee === 'number') return Number(it.fee);
              const maybeString = it.financial_fee ?? it.fee ?? it.financial_fee_id ?? it.financialFee;
              if (typeof maybeString === 'string') {
                if (/^\d+$/.test(maybeString)) return Number(maybeString);
                const m = maybeString.match(/(\d+)\/?$/);
                if (m) return Number(m[1]);
              }
              if (typeof it.financial_fee === 'object' && it.financial_fee !== null) {
                if (it.financial_fee.id) return Number(it.financial_fee.id);
                if (it.financial_fee.pk) return Number(it.financial_fee.pk);
              }
              return null;
            };
            const match = items.find((it) => {
              const fee = extractFeeId(it);
              const statusText = String(it?.status || '');
              return fee !== null && fee === Number(feeId) && /(pendiente|pending)/i.test(statusText);
            });
            if (match) {
              const paymentUrl = match.payment_url || match.gateway_response?.payment_url;
              const sessionId = match.transaction_id || match.gateway_response?.stripe_session_id;
              if (paymentUrl) {
                try { if (sessionId) localStorage.setItem('pendingPaymentSession', sessionId); } catch (err) { console.warn('[PaymentMethod] localStorage write failed', err); }
                window.location.href = paymentUrl;
                return;
              }
              if (sessionId) {
                try { localStorage.setItem('pendingPaymentSession', sessionId); } catch (err) { console.warn('[PaymentMethod] localStorage write failed', err); }
                window.location.href = `${FRONTEND_BASE}/payment-success?transaction_id=${encodeURIComponent(sessionId)}`;
                return;
              }
            }
            const sample = items.slice(0,3);
            setSnackbar({ open: true, message: `Transacción pendiente. Ejemplo payments: ${JSON.stringify(sample).slice(0,300)}`, severity: 'info' });
            navigate('/finances');
            return;
          } catch (listErr) {
            console.error('error fetching payments', listErr);
          }
        }
        // otherwise show last error
        setSnackbar({ open: true, message: lastError?.response?.data || lastError?.message || 'Error iniciando pago', severity: 'error' });
        return;
      }

      setSnackbar({ open: true, message: 'No se pudo iniciar el pago con las variantes probadas', severity: 'error' });
      return;
    } catch (fatalErr: any) {
      console.error('fatal initiate-payment', fatalErr);
      setSnackbar({ open: true, message: fatalErr?.message || 'Error inesperado iniciando pago', severity: 'error' });
      return;
    }
  };

  return (
    <Card sx={{ maxWidth: 700, margin: '24px auto' }}>
      <CardContent>
        <Typography variant="h6">Seleccionar método de pago</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>Sólo está habilitado el pago con tarjeta.</Typography>

        <Box sx={{ display: 'grid', gap: 2 }}>
          <TextField label="Número de tarjeta" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} />
          <TextField label="MM/AA" value={exp} onChange={(e) => setExp(e.target.value)} />
          <TextField label="CVC" value={cvc} onChange={(e) => setCvc(e.target.value)} />

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={handlePay}>Pagar con tarjeta</Button>
            <Button variant="outlined" onClick={() => navigate('/finances')}>Cancelar</Button>
          </Box>
        </Box>

        <Snackbar open={snackbar.open} autoHideDuration={8000} onClose={closeSnackbar}>
          <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
}
