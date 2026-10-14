import { api } from "./client";

export function getProducts() {
  return api.get("/api/products");
}
