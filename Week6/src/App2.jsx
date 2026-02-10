import { useState, useEffect, useRef } from 'react'

import * as bootstrap from "bootstrap";
import "./assets/style.css";
import axios from "axios";
import ProductModal from './components/ProductModal';
import Pagination from './components/Pagination';
import Login from './views/Login';

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

const INITIAL_TEMPLATE_DATA = {
  id: "",
  title: "",
  category: "",
  origin_price: "",
  price: "",
  unit: "",
  description: "",
  content: "",
  is_enabled: false,
  imageUrl: "",
  imagesUrl: [],
};


function App() {
  // #2. useState & isAuth 管理表單資料與登入狀態


  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState('');
  const [pagination, setPagination] = useState({});

  const productModalRef = useRef(null);


  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("oriToken="))
      ?.split("=")[1];
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
    }

    productModalRef.current = new bootstrap.Modal("#productModal", {
      keyboard: false
    });


    const checkLogin = async () => {
      try {
        const response = await axios.post(`${API_BASE}/api/user/check`);
        console.log(response.data);
        setIsAuth(true);
        getProducts();
      } catch (error) {
        console.error("Token 驗證失敗：", error.response?.data.message);
        setIsAuth(false);
      }
    };

    checkLogin();
  }, []);

  // #6. 取得產品列表函式 (取得產品資料API)
  const getProducts = async (page = 1) => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products?page=${page}`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("取得產品列表失敗：", error.response?.data.message);
    }
  };

  const openProductModal = (type, product) => {
    // console.log(product);
    setModalType(type);
    setTemplateProduct((prevData) => ({
      ...prevData,
      ...product,
    })); productModalRef.current.show();
  };

  const closeProductModal = () => {
    productModalRef.current.hide();
  };


  return (
    <>
      {!isAuth ? (
        <Login getProducts={getProducts} setIsAuth={setIsAuth} />
      ) : (
        <div className="container">
          <h2>產品列表</h2>
          <div className="text-end mt-4">
            <button type="button" className="btn btn-primary"
              onClick={() => openProductModal('create', INITIAL_TEMPLATE_DATA)}>
              建立新的產品
            </button>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th scope="col"><h5>分類</h5></th>
                <th scope="col"><h5>產品名稱</h5></th>
                <th scope="col"><h5>原價</h5></th>
                <th scope="col"><h5>售價</h5></th>
                <th scope="col"><h5>是否啟用</h5></th>
                <th scope="col"><h5>編輯</h5></th>
              </tr>
            </thead>
            <tbody>
              {
                products.map(product => (
                  <tr key={product.id}>
                    <td>{product.category}</td>
                    <th scope="row">{product.title}</th>
                    <td>{product.origin_price}</td>
                    <td>{product.price}</td>
                    <td className={`${product.is_enabled && "text-success"}`}>{product.is_enabled ? "啟用" : "未啟用"}</td>
                    <td>
                      <div className="btn-group" role="group" aria-label="Basic example">
                        <button type="button" className="btn btn-outline-success btn-sm"
                          onClick={() => openProductModal('edit', product)}>編輯</button>
                        <button type="button" className="btn btn-outline-danger btn-sm"
                          onClick={() => openProductModal('delete', product)}>刪除</button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
          <Pagination pagination={pagination} onChangePage={getProducts} />
        </div>
      )}

      <ProductModal
        modalType={modalType}
        templateProduct={templateProduct}
        closeProductModal={closeProductModal}
        productModalRef={productModalRef}
        getProducts={getProducts}
      />
    </>
  );
}

export default App;
