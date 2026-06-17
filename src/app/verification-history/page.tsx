import AppLayout from '@/components/AppLayout';
import VerificationHistoryContent from './components/VerificationHistoryContent';

export default function VerificationHistoryPage() {
  return (
    <AppLayout activePath="/verification-history">
      <VerificationHistoryContent />
    </AppLayout>
  );
}
