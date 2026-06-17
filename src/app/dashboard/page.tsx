import React from 'react';
import AppLayout from '@/components/AppLayout';
import DocumentUploadContent from '../components/DocumentUploadContent';

export default function DashboardPage() {
  return (
    <AppLayout activePath="/dashboard">
      <DocumentUploadContent />
    </AppLayout>
  );
}
