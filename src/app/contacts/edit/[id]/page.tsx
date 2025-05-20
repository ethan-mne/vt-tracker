import AppLayout from '../../../../components/layout/AppLayout';
import EditContactPage from '../../../../pages/EditContactPage';

export default function EditContact({ params }: { params: { id: string } }) {
  return (
    <AppLayout>
      <EditContactPage id={params.id} />
    </AppLayout>
  );
} 