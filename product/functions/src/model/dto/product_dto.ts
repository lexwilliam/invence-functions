import { Timestamp } from "firebase-admin/firestore";
import { Product } from "../product";
import { JsonTimestamp } from "../timestamp";
import { MapProductItemFromJson, ProductItemDto } from "./product_item_dto";

export type ProductDto = {
  sku: string;
  upc: string;
  name: string;
  description: string;
  category_name: string;
  sell_price: number;
  items: ProductItemDto[];
  image_path: string;
  created_at: JsonTimestamp;
  updated_at?: JsonTimestamp;
};

export function MapProductFromJson(json: ProductDto): Product {
  return {
    sku: json.sku,
    upc: json.upc,
    name: json.name,
    description: json.description,
    category_name: json.category_name,
    sell_price: json.sell_price,
    items: json.items?.map(MapProductItemFromJson),
    image_path: json.image_path,
    created_at: new Timestamp(json.created_at.seconds, json.created_at.nanoseconds),
    updated_at: json.updated_at
      ? new Timestamp(json.updated_at.seconds, json.updated_at.nanoseconds)
      : null,
  };
}