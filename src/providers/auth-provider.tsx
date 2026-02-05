'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';

import { FirebaseAuth } from '@lib';
import { loginBasic, logout, checkingCredentials } from '@store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkingCredentials());

    const unsubscribe = onAuthStateChanged(FirebaseAuth, (user) => {
      if (!user) {
        dispatch(logout());
        return;
      }

      // SOLO info que Firebase ya conoce
      dispatch(
        loginBasic({
          uid: user.uid,
          email: user.email,
          photoURL: user.photoURL,
        })
      );
    });

    return () => unsubscribe();
  }, [dispatch]);

  return <>{children}</>;
}
