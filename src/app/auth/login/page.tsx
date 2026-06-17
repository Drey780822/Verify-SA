import React, { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
