import { Timestamp } from "firebase-admin/firestore";
import { Order } from "./order";
import { OrderTax } from "./order_tax";
import { OrderDiscount } from "./order_discount";

export type OrderGroup = {
  uuid: string;
  branch_uuid: string;
  created_by: string;
  orders: Map<string, Order>;
  taxes: Map<string, OrderTax>;
  discounts: Map<string, OrderDiscount>;
  created_at: Timestamp;
  deleted_at: Timestamp;
  completed_at: Timestamp;
};