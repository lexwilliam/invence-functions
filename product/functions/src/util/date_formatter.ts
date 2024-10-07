import { Timestamp } from "firebase-admin/firestore";

export function formatMonth(date: Timestamp): string {
  return date.toDate().toISOString().slice(0, 7);
}

export function formatDate(date: Timestamp): string {
  return date.toDate().toISOString().split("T")[0];
}