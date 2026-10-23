import React from "react";
import OrdersView from "../components/orders/OrdersView";

const AdminOrdersPage: React.FC = () => (
  <OrdersView endpoint="/alltransactions" subtitle="Administrador · Todas las transacciones" admin />
);

export default AdminOrdersPage;
