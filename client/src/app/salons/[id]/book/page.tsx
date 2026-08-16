import { BookingFlow } from "./BookingFlow";

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingFlow salonId={id} />;
}
