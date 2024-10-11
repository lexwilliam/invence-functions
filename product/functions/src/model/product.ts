import { Timestamp } from "firebase-admin/firestore";
import {  ProductItem } from "./product_item";

export type Product = {
    sku: string;
    upc: string;
    name: string;
    description: string;
    category_name: string;
    sell_price: number;
    items: ProductItem[];
    image_path: string;
    created_at: Timestamp;
    updated_at: Timestamp | null;
}