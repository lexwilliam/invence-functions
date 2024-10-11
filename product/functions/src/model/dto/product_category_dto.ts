import { Product } from "../product";
import { ProductCategory } from "../product_category";
import { JsonTimestamp } from "../timestamp";
import { MapProductFromJson, ProductDto } from "./product_dto";
import { Timestamp } from "firebase-admin/firestore";

export type ProductCategoryDto = {
  uuid: string;
  branch_uuid: string;
  name: string;
  image_url: string;
  products: { [key: string]: ProductDto };
  created_at: JsonTimestamp;
  deleted_at?: JsonTimestamp;
};

export function MapProductCategoryFromJson(
  json: ProductCategoryDto
): ProductCategory {
  return {
    uuid: json.uuid,
    branch_uuid: json.branch_uuid,
    name: json.name,
    image_url: json.image_url,
    products: new Map<string, Product>(
      Object.entries(json.products).map(([key, product]) => [
        key,
        MapProductFromJson(product),
      ])
    ),
    created_at: new Timestamp(
      json.created_at.seconds,
      json.created_at.nanoseconds
    ),
    deleted_at: json.deleted_at
      ? new Timestamp(json.deleted_at.seconds, json.deleted_at.nanoseconds)
      : null,
  };
}
