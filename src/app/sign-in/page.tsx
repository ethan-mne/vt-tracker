'use client';

import { Suspense } from 'react';
import AuthLayout from '../../components/layout/AuthLayout';
import SignInPage from '../../pages/SignInPage';
import Loading from '../loading';

export default function SignIn() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    </Suspense>
  );
} 