import { Timestamp } from "firebase-admin/firestore";

export type ProductItem = {
    itemId: number;
    quantity: number;
    buy_price: number;
    created_at: Timestamp;
    deleted_at: Timestamp;
}