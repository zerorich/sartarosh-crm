import { BarberDetailPage } from "@/views/barbers/BarberDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BarberDetailPage id={id} />;
}
