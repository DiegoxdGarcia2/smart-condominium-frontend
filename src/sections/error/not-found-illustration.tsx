import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type PageNotFoundIllustrationProps = {
  sx?: SxProps<Theme>;
};

export function PageNotFoundIllustration({ sx, ...other }: PageNotFoundIllustrationProps) {
  return (
    <Box
      component="svg"
      width="100%"
      height="100%"
      viewBox="0 0 480 360"
      sx={{ ...sx }}
      {...other}
    >
      <defs>
        <linearGradient id="BG" x1="19.496%" x2="77.479%" y1="71.822%" y2="16.69%">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        fill="url(#BG)"
        d="M0 198.78c0 41.458 14.945 79.236 39.539 107.786 28.214 32.765 69.128 53.365 114.734 53.434a148.44 148.44 0 0056.495-11.036c9.051-3.699 19.182-3.274 27.948 1.107a75.779 75.779 0 0033.957 8.01c5.023 0 9.942-.494 14.7-1.433 13.58-2.680 25.94-8.906 36.09-17.94 30.73-27.370 50.543-68.336 50.543-113.687C373.006 124.911 298.57 51 202.503 51S32 124.911 32 224.042c0 2.006.032 4.007.098 6.002C32.032 230.08 32 230.117 32 230.117s0-.038-.032-.038c.032 2.007.032 4.007.032 6.002z"
        opacity="0.24"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="120"
        fontFamily="system-ui, sans-serif"
        fontWeight="bold"
        fill="currentColor"
        opacity="0.1"
      >
        404
      </text>
    </Box>
  );
}
