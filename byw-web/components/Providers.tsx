'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import AppShell from '@/components/AppShell';
import ThemeRegistry from '@/components/ThemeRegistry';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeRegistry>
      <AuthProvider>
        <AppShell>{children}</AppShell>
      </AuthProvider>
    </ThemeRegistry>
  );
}
