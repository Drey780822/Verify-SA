import AppLayout from '@/components/AppLayout';
import OrganizationAdminContent from './components/OrganizationAdminContent';

export default function OrganizationPage() {
  return (
    <AppLayout activePath="/organization">
      <OrganizationAdminContent />
    </AppLayout>
  );
}
