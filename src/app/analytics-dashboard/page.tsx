import React from 'react';
import AppLayout from '@/components/AppLayout';
import AnalyticsDashboardContent from './components/AnalyticsDashboardContent';

export default function AnalyticsDashboardPage() {
  return (
    <AppLayout activePath="/analytics-dashboard">
      <AnalyticsDashboardContent />
    </AppLayout>
  );
}