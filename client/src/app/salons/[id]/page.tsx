import { SalonDetailView } from "./SalonDetailView";

export default async function SalonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SalonDetailView salonId={id} />;
}
