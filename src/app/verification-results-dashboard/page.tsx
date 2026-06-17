import React from 'react';
import AppLayout from '@/components/AppLayout';
import VerificationResultsContent from './components/VerificationResultsContent';

export default function VerificationResultsDashboardPage() {
  return (
    <AppLayout activePath="/verification-results-dashboard">
      <VerificationResultsContent />
    </AppLayout>
  );
}