import type { Metadata } from "next";
import { PaymentsList } from "@/components/payments/payments-list";

export const instant = false;

export const metadata: Metadata = {
  title: "Pagamenti",
};

export default function PaymentsPage() {
  return <PaymentsList />;
}
