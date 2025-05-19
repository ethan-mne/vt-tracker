import AppLayout from '../../../../components/layout/AppLayout';
import EditContactPage from '../../../../pages/EditContactPage';

export default async function EditContact({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppLayout>
      <EditContactPage id={id} />
    </AppLayout>
  );
} 