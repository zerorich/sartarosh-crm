import { BookingDetailView } from "./BookingDetailView";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingDetailView bookingId={id} />;
}
