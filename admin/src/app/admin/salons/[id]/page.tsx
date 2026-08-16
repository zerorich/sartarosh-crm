import { SalonDetailPage } from "@/views/salons/SalonDetailPage";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SalonDetailPage id={id} />;
}
