import React from "react";
import OrdersView from "../components/orders/OrdersView";

const OrdersPage: React.FC = () => <OrdersView endpoint="/transactions" subtitle="Tus transacciones" />;

export default OrdersPage;
