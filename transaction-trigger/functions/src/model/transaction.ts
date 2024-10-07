import { Timestamp } from "firebase-admin/firestore";
import { OrderGroup } from "./order_group";

export type Transaction = {
  uuid: string;
  branch_uuid: string;
  order_group: OrderGroup;
  customer: string;
  total: number;
  profit: number;
  created_by: Timestamp;
  created_at: Timestamp;
  deleted_at: Timestamp;
};