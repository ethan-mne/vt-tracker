'use client';

import { Suspense } from 'react';
import AuthLayout from '../../components/layout/AuthLayout';
import SignUpPage from '../../pages/SignUpPage';
import Loading from '../loading';

export default function SignUp() {
  return (
    <Suspense fallback={<Loading />}>
      <AuthLayout>
        <SignUpPage />
      </AuthLayout>
    </Suspense>
  );
} 