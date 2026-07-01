import Box from '@mui/material/Box';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        pt: { xs: 2, sm: 6 },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 480 }}>{children}</Box>
    </Box>
  );
}
