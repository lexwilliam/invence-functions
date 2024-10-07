import { Timestamp } from "firebase-admin/firestore";

export function formatDate(date: Timestamp): string {
  return date.toDate().toISOString().split("T")[0];
}