import { createHashRouter } from "react-router";
import FrontendLayout from "./layout/FrontendLayout";
import Home from "./views/front/Home";
import Products from "./views/front/Products";
import SingleProduct from "./views/front/SingleProduct";
import Cart from "./views/front/Cart";
import NotFoundPage from "./views/front/NotFoundPage";
import Checkout from "./views/front/Checkout";
import Login from "./views/Login";
import AdminLayout from "./layout/AdminLayout";
import AdminProducts from "./admin/AdminProducts";
import AdminOrders from "./admin/AdminOrders";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createHashRouter([
    {
        path: "/",
        element: <FrontendLayout />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "products",
                element: <Products />
            },
            {
                path: "products/:id",
                element: <SingleProduct />
            },
            {
                path: "cart",
                element: <Cart />
            },
            {
                path: "checkout",
                element: <Checkout />
            },
            {
                path: "login",
                element: <Login />
            }
        ]
    },
    {
        path: "admin",
        element: (
            <ProtectedRoute>
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: "product",
                element: <AdminProducts />
            },
            {
                path: "order",
                element: <AdminOrders />
            }
        ]
    },
    {
        path: "*",
        element: <NotFoundPage />
    }
]);

