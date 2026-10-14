import { api } from "./client";

export function startPayPal(order) {
  return api.post("/api/orders/paypal", order);
}

export function capturePayPal(order) {
  return api.post("/api/orders/paypal/capture", order);
}

export function getMyOrders() {
  return api.get("/api/orders");
}

export function getOrder(orderNumber) {
  return api.get(`/api/orders/${encodeURIComponent(orderNumber)}`);
}

export function requestReturn(orderNumber, body) {
  return api.post(`/api/orders/${encodeURIComponent(orderNumber)}/returns`, body);
}

export function getAdminReturns() {
  return api.get("/api/admin/returns");
}

export function rejectReturn(returnNumber) {
  return api.post(`/api/admin/returns/${encodeURIComponent(returnNumber)}/reject`);
}

export function refundReturn(returnNumber) {
  return api.post(`/api/admin/returns/${encodeURIComponent(returnNumber)}/refund`);
}
