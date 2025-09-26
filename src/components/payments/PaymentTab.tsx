// PaymentTab.tsx
import axios from 'axios';
import React, { useState, useEffect } from 'react';

import { Box, Alert, Button, Snackbar, Typography, CircularProgress } from '@mui/material';

// Importar el hook de autenticación para obtener el usuario actual
import { useAuth } from '../../context/AuthContext';

type Props = {
  financialFeeId?: number | string;
  accessToken?: string;
  onOpenPaymentsList?: () => void;
  onPaymentsUpdated?: () => void;
};

export default function PaymentTab({ financialFeeId, accessToken: tokenProp, onOpenPaymentsList, onPaymentsUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingFees, setLoadingFees] = useState(false);
  const [notice, setNotice] = useState<{ severity: 'info'|'error'|'warning'|'success', text: string } | null>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [userUnits, setUserUnits] = useState<any[]>([]); // Unidades del usuario

  // Obtener información del usuario actual desde el contexto
  const { user } = useAuth();
  const userRole = user?.role_name?.toLowerCase();
  const isResident = userRole === 'resident' || userRole === 'residente';

  // TODO: Si no se pasa accessToken por props, obtenerlo del contexto/Redux o localStorage:
  const accessToken = tokenProp || localStorage.getItem('accessToken') || '';

  const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000';
  const API_INITIATE = `${API_BASE}/api/administration/payments/initiate_payment/`;
  const API_PAYMENTS = `${API_BASE}/api/administration/payments/`;

  const buildStripeUrl = (sessionId: string) => `https://checkout.stripe.com/c/pay/${sessionId}`;

  // Función para obtener las unidades del usuario actual
  const loadUserUnits = async () => {
    if (!isResident || !user?.id || !accessToken) return [];
    
    try {
      console.log('PaymentTab: Cargando unidades del residente ID:', user.id);
      const unitsUrl = `${API_BASE}/api/administration/units/?resident=${user.id}`;
      const res = await axios.get(unitsUrl, { 
        headers: { Authorization: `Bearer ${accessToken}` } 
      });
      const units = res.data?.results || res.data || [];
      console.log('PaymentTab: Unidades del usuario:', units);
      return units;
    } catch (error) {
      console.log('PaymentTab: Error cargando unidades, usando nombre del usuario como fallback');
      return [];
    }
  };

  // Load fees if no specific fee ID is provided
  useEffect(() => {
    if (financialFeeId) return; // Don't load list if specific fee is provided

    const loadFees = async () => {
      if (!accessToken) {
        setNotice({ severity: 'error', text: 'No autorizado. Inicia sesión.' });
        return;
      }

      setLoadingFees(true);
      try {
        // Si es residente, primero cargar sus unidades
        const units = isResident ? await loadUserUnits() : [];
        const unitIds = units.map((u: any) => u.id);
        const userFullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
        
        console.log('PaymentTab: Información del usuario:', { 
          isResident, 
          userId: user?.id, 
          userRole,
          userName: userFullName,
          unitsIds: unitIds
        });

        // Cargar todas las cuotas (sin filtro backend por ahora, ya que no funciona)
        const listUrl = `${API_BASE}/api/administration/financial-fees/?page=1`;
        console.log('PaymentTab: Cargando cuotas desde:', listUrl);
        
        const res = await axios.get(listUrl, { 
          headers: { Authorization: `Bearer ${accessToken}` } 
        });
        const data = res.data;
        const all = Array.isArray(data) ? data : (data?.results || []);
        
        console.log('PaymentTab: Todas las cuotas recibidas:', all.length);
        console.log('PaymentTab: Primera cuota completa:', JSON.stringify(all[0], null, 2));
        
        const pending = all.filter((f: any) => String(f.status || '').toLowerCase() === 'pendiente');
        console.log('PaymentTab: Cuotas pendientes después de filtro status:', pending.length);
        
        // Filtro por residente usando unidades o nombre
        const filteredFees = isResident ? 
          pending.filter((f: any) => {
            // Opción 1: Filtrar por ID de unidad
            const matchByUnit = unitIds.includes(f.unit);
            // Opción 2: Filtrar por nombre del propietario
            const matchByOwner = f.unit_owner === userFullName;
            
            const match = matchByUnit || matchByOwner;
            
            console.log('PaymentTab: Evaluando cuota', f.id, ':', {
              unitId: f.unit,
              unitOwner: f.unit_owner,
              userUnits: unitIds,
              userName: userFullName,
              matchByUnit,
              matchByOwner,
              finalMatch: match
            });
            
            return match;
          }) :
          pending;
        
        console.log('PaymentTab: Cuotas finales para el residente:', filteredFees.length);
        
        setFees(filteredFees);
      } catch (e: any) {
        if (e?.response?.status === 401) {
          setNotice({ severity: 'error', text: 'No autorizado. Inicia sesión nuevamente.' });
        } else {
          setNotice({ severity: 'error', text: 'Error cargando cuotas pendientes.' });
        }
      } finally {
        setLoadingFees(false);
      }
    };

    loadFees();
  }, [financialFeeId, accessToken, API_BASE, isResident, user?.id]);  const fetchPendingAndRedirect = async (feeId: number | string): Promise<boolean> => {
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      
      // Si es residente, filtrar por su ID en la consulta de pagos
      let paymentsUrl = API_PAYMENTS;
      if (isResident && user?.id) {
        paymentsUrl += `?resident=${user.id}`;
      }
      
      console.log('PaymentTab: Consultando pagos pendientes desde:', paymentsUrl);
      
      const r = await axios.get(paymentsUrl, { headers });
      const data = r.data;
      const items = Array.isArray(data) ? data : (data.results || []);

      // Buscar transacción pendiente para esta cuota
      let candidates = items.filter((p: any) => {
        const fee = p.financial_fee ?? p.fee ?? p.fee_id;
        const status = (p.status || '').toLowerCase();
        return String(fee) === String(feeId) && (status.includes('pendiente') || status.includes('proces'));
      });
      
      // Filtro adicional por residente si es necesario
      if (isResident && user?.id) {
        candidates = candidates.filter((p: any) =>
          p.resident === user.id ||
          p.resident_id === user.id ||
          p.financial_fee?.resident === user.id ||
          p.financial_fee?.resident_id === user.id
        );
      }
      
      const candidate = candidates[0]; // Tomar el primer candidato

      if (!candidate) {
        setNotice({ severity: 'info', text: 'No se encontró transacción pendiente. Intenta de nuevo.' });
        return false;
      }

      const gw = candidate.gateway_response || {};
      const sessionId = gw.stripe_session_id || gw.session_id || candidate.transaction_id;
      const paymentUrl = candidate.payment_url || gw.payment_url;

      if (paymentUrl) {
        window.location.href = paymentUrl;
        return true;
      }
      if (sessionId) {
        window.location.href = buildStripeUrl(sessionId);
        return true;
      }

      setNotice({ severity: 'warning', text: 'Transacción pendiente encontrada pero sin sesión de Stripe.' });
      if (onOpenPaymentsList) onOpenPaymentsList();
      return false;
    } catch (e: any) {
      console.error('fetchPendingAndRedirect error', e);
      setNotice({ severity: 'error', text: 'Error consultando transacciones pendientes.' });
      return false;
    }
  };

  const handlePay = async (targetFeeId?: number | string) => {
    const feeId = targetFeeId || financialFeeId;
    if (!feeId) {
      setNotice({ severity: 'error', text: 'No se encontró la cuota a pagar.' });
      return;
    }
    if (!accessToken) {
      setNotice({ severity: 'error', text: 'No autorizado. Inicia sesión.' });
      return;
    }

    setLoading(true);
    setLoadingId(String(feeId));
    setNotice(null);
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` };
      const body = { financial_fee_id: Number(feeId) };
      
      console.log('PaymentTab: Iniciando pago para cuota:', feeId);
      console.log('PaymentTab: Endpoint:', API_INITIATE);
      console.log('PaymentTab: Body:', body);
      console.log('PaymentTab: Headers:', headers);
      
      const resp = await axios.post(API_INITIATE, body, { headers });
      
      console.log('PaymentTab: Respuesta completa del backend:', resp);
      console.log('PaymentTab: Status:', resp.status);
      console.log('PaymentTab: Data completo:', resp.data);
      
      // Verificar longitud y validez de la URL
      const paymentUrl = resp.data?.payment_url;
      console.log('PaymentTab: URL de pago recibida:', paymentUrl);
      console.log('PaymentTab: Tipo de URL:', typeof paymentUrl);
      console.log('PaymentTab: Longitud de URL:', paymentUrl?.length);
      console.log('PaymentTab: URL empieza con https://checkout.stripe.com?:', paymentUrl?.startsWith('https://checkout.stripe.com'));
      console.log('PaymentTab: URL contiene hash (#)?:', paymentUrl?.includes('#'));

      // Manejar respuesta correcta (201) con payment_url
      if ((resp.status === 201 || resp.status === 200) && paymentUrl) {
        console.log('PaymentTab: ✅ Redirigiendo a Stripe con URL:', paymentUrl);
        
        if (resp.data?.existing) {
          // optional: mostrar mensaje breve antes de redirigir
          setNotice({ severity: 'info', text: 'Usando sesión pendiente — redirigiendo al checkout...' });
          setTimeout(() => { 
            console.log('PaymentTab: 🚀 Ejecutando redirección...'); 
            window.location.href = paymentUrl; 
          }, 600);
        } else {
          console.log('PaymentTab: 🚀 Ejecutando redirección inmediata...'); 
          window.location.href = paymentUrl;
        }
        
        // Call callback if available
        if (onPaymentsUpdated) {
          await Promise.resolve(onPaymentsUpdated());
        }
        return;
      }

      setNotice({ severity: 'warning', text: 'Respuesta inesperada del servidor.' });
    } catch (err: any) {
      console.error('PaymentTab: Error en handlePay:', err);
      console.error('PaymentTab: Response data:', err?.response?.data);
      console.error('PaymentTab: Response status:', err?.response?.status);
      
      const resp = err?.response;
      if (resp && resp.status === 400) {
        const raw = resp.data?.error || resp.data?.detail || JSON.stringify(resp.data || {});
        setNotice({ severity: 'info', text: String(raw) });

        // Si backend devolvió 400 con mensaje de pendiente (compatibilidad), intentar buscar y redirigir
        if (String(raw).toLowerCase().includes('pendiente')) {
          await fetchPendingAndRedirect(feeId);
        }
      } else if (resp && resp.status === 401) {
        setNotice({ severity: 'error', text: 'No autorizado. Inicia sesión nuevamente.' });
      } else {
        setNotice({ severity: 'error', text: err?.message || 'Error en la petición.' });
      }
    } finally {
      setLoading(false);
      setLoadingId(null);
    }
  };

  // If specific fee ID is provided, show single button
  if (financialFeeId) {
    return (
      <div>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handlePay()} 
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Pagar Ahora'}
        </Button>

        <Snackbar open={!!notice} autoHideDuration={9000} onClose={() => setNotice(null)}>
          <Alert onClose={() => setNotice(null)} severity={notice?.severity || 'info'}>
            {notice?.text || ''}
          </Alert>
        </Snackbar>
      </div>
    );
  }

  // Show list of pending fees
  return (
    <Box>
      {loadingFees ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Cargando cuotas pendientes...</Typography>
        </Box>
      ) : fees.length === 0 ? (
        <Typography>
          {isResident ? 'No tienes cuotas pendientes para pagar.' : 'No hay cuotas pendientes para pagar.'}
        </Typography>
      ) : (
        <Box component="ul" sx={{ listStyle: 'none', p: 0 }}>
          {fees.map((f: any) => (
            <Box component="li" key={f.id} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography><strong>Unidad:</strong> {f.unit_number}</Typography>
                  <Typography><strong>Descripción:</strong> {f.description}</Typography>
                  <Typography><strong>Monto:</strong> ${f.amount}</Typography>
                </Box>
                <Box>
                  <Button 
                    variant="contained" 
                    onClick={() => handlePay(f.id)} 
                    disabled={loadingId === String(f.id) && loading}
                  >
                    {(loadingId === String(f.id) && loading) ? <CircularProgress size={18} /> : 'Pagar Ahora'}
                  </Button>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Snackbar open={!!notice} autoHideDuration={9000} onClose={() => setNotice(null)}>
        <Alert onClose={() => setNotice(null)} severity={notice?.severity || 'info'}>
          {notice?.text || ''}
        </Alert>
      </Snackbar>
    </Box>
  );
}