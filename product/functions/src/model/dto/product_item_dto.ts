import { Timestamp } from "firebase-admin/firestore";
import { ProductItem } from "../product_item";
import { JsonTimestamp } from "../timestamp";

export type ProductItemDto = {
  itemId: number;
  quantity: number;
  buy_price: number;
  created_at: JsonTimestamp;
  deleted_at?: JsonTimestamp;
};

export function MapProductItemFromJson(json: ProductItemDto): ProductItem {
  return {
    itemId: json.itemId,
    quantity: json.quantity,
    buy_price: json.buy_price,
    created_at: new Timestamp(json.created_at.seconds, json.created_at.nanoseconds),
    deleted_at: json.deleted_at
      ? new Timestamp(json.deleted_at.seconds, json.deleted_at.nanoseconds)
      : null,
  };
}
