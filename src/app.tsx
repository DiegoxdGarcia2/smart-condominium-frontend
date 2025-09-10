import 'src/global.css';

// external imports
import { useEffect } from 'react';

// routes
import AuthLoader from 'src/routes/AuthLoader';
import { usePathname } from 'src/routes/hooks';

// internal imports
import { AuthProvider } from 'src/context/AuthContext';
import { ThemeProvider } from 'src/theme/theme-provider';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <ThemeProvider>
      <AuthProvider>
        <AuthLoader>
          {children}
        </AuthLoader>
      </AuthProvider>
    </ThemeProvider>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
