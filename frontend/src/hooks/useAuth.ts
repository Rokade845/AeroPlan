import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiAuth, UserProfile } from '../utils/api';

export const useAuth = (requireAuth = true) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const localUser = apiAuth.getLocalUser();
      
      if (!localUser) {
        if (requireAuth) {
          router.replace('/login');
        } else {
          setLoading(false);
        }
        return;
      }

      setUser(localUser);

      // Verify token with backend
      try {
        const verifiedUser = await apiAuth.getCurrentUser();
        if (verifiedUser) {
          setUser(verifiedUser);
        } else {
          // If verification returns null or fails, apiAuth handles the token clear
          if (requireAuth) {
            router.replace('/login');
          }
        }
      } catch (error) {
        console.error('Session verification failed:', error);
        if (requireAuth) {
          router.replace('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requireAuth, router]);

  return { user, loading, logout: () => {
    apiAuth.logout();
    router.replace('/login');
  }};
};
