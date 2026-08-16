import { BarberDetailView } from "./BarberDetailView";

export default async function BarberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BarberDetailView barberId={id} />;
}
