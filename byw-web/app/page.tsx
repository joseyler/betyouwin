import Typography from '@mui/material/Typography';
import ApiHealthCheck from '@/components/ApiHealthCheck';

export default function Home() {
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom>
        BetYouWin
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Plataforma de apuestas deportivas — Mundial 2026
      </Typography>
      <ApiHealthCheck />
    </>
  );
}
