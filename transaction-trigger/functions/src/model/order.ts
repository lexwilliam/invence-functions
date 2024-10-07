import { Timestamp } from "firebase-admin/firestore";
import { OrderItem } from "./order_item";
import { OrderDiscount } from "./order_discount";

export type Order = {
    uuid: string;
    item: OrderItem;
    discounts: Map<string, OrderDiscount>;
    quantity: number;
    refunded_quantity: number;
    note: string;
    created_at: Timestamp;
    updated_at: Timestamp;
    deleted_at: Timestamp;
}