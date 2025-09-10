import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { PageNotFoundIllustration } from './not-found-illustration';

// ----------------------------------------------------------------------

export function NotFoundView() {
  return (
    <Container>
      <Box
        sx={{
          py: 12,
          maxWidth: 480,
          mx: 'auto',
          display: 'flex',
          minHeight: '100vh',
          textAlign: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h3" sx={{ mb: 3 }}>
          ¡Página no encontrada!
        </Typography>

        <Typography sx={{ color: 'text.secondary' }}>
          Lo sentimos, no pudimos encontrar la página que estás buscando.
          ¿Quizás has escrito mal la URL? Asegúrate de verificar tu ortografía.
        </Typography>

        <PageNotFoundIllustration sx={{ height: 260, my: { xs: 5, sm: 10 } }} />

        <Button component={RouterLink} href="/" size="large" variant="contained">
          Ir al Dashboard
        </Button>
      </Box>
    </Container>
  );
}
