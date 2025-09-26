// PaymentSuccess.tsx
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Alert, Button, CircularProgress } from '@mui/material';

function useQuery() { return new URLSearchParams(useLocation().search); }

export default function PaymentSuccess({ accessToken }: { accessToken?: string }) {
  const q = useQuery();
  const sessionId = q.get('session_id');
  const [status, setStatus] = useState<'checking'|'done'|'timeout'|'error'>('checking');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) { setStatus('error'); setMessage('No session_id en la URL.'); return; }
    const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';
    const headers = { Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}` };
    const deadline = Date.now() + 60000;

    const check = async () => {
      try {
        const r = await axios.get(`${API_BASE}/api/administration/payments/`, { headers });
        const data = r.data;
        const items = Array.isArray(data) ? data : (data.results || []);
        const tx = items.find((p: any) =>
          p.transaction_id === sessionId ||
          (p.gateway_response && (p.gateway_response.stripe_session_id === sessionId || p.gateway_response.session_id === sessionId))
        );
        if (tx && tx.status === 'Completado') { 
          setStatus('done'); 
          setMessage('¡Pago confirmado exitosamente!');
          return; 
        }
        if (Date.now() < deadline) setTimeout(check, 2000);
        else { setStatus('timeout'); setMessage('Aún no se confirmó el pago. Intenta nuevamente.'); }
      } catch (e) {
        if (Date.now() < deadline) setTimeout(check, 2000);
        else { setStatus('error'); setMessage('Error verificando pago.'); }
      }
    };

    check();
  }, [sessionId, accessToken]);

  if (status === 'checking') return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '20px' }}>
      <CircularProgress size={24} /> Comprobando pago...
    </div>
  );
  
  if (status === 'done') return (
    <Alert severity="success">{message || 'Pago confirmado. ¡Gracias!'}</Alert>
  );
  
  if (status === 'timeout') return (
    <div>
      <Alert severity="warning">{message}</Alert>
      <Button variant="contained" onClick={() => navigate('/finances')} style={{ marginTop: '10px' }}>
        Ir a mis pagos
      </Button>
    </div>
  );
  
  return (
    <Alert severity="error">{message}</Alert>
  );
}
