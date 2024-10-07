import { Timestamp } from "firebase-admin/firestore";
import { Product } from "./product";

export type ProductCategory = {
  uuid: string;
  branch_uuid: string;
  name: string;
  image_url: string;
  products: { [key: string]: Product };
  created_at: Timestamp;
  deleted_at: Timestamp;
};
