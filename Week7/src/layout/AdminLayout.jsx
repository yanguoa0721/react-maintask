import { Link, Outlet } from "react-router";

function AdminLayout() {
    return (
        <>
            <header>
                <ul className="nav">
                    <li className="nav-item">
                        <Link className="nav-link" to="/admin/product">後台產品列表</Link>
                    </li>
                     <li className="nav-item">
                        <Link className="nav-link" to="/admin/order">後台訂單列表</Link>
                    </li>
                </ul>
            </header>
            <main>
                <Outlet />
            </main>
            <footer className="mt-5 text-center">
                <p>© 2026 MyFirstPatisserieStore</p>
            </footer>

        </>
    )
}

export default AdminLayout;