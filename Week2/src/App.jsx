import { useState } from 'react'

import "./assets/style.css";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {

  // #2. useState & isAuth 管理表單資料與登入狀態
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);

  // #3. 表單輸入變更處理函式
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({
      ...preData,
      [name]: value,
    }))  // preData 代表先前的表單資料
  };

  // #4. 表單提交處理函式 (登入API)
  const onSubmit = async (e) => {
    try {
      e.preventDefault(); // 防止表單預設提交行為
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;
      document.cookie = `oriToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common["Authorization"] = token;
      setIsAuth(true);
      await getProducts(); 
    } catch (error) {
      setIsAuth(false);
      console.log(error.response);
    }
  };

  // #5. 檢查登入狀態函式 (驗證Token)
  const checkLogin = async () => {
    try {
      // 從 Cookie 取得 Token
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("oriToken="))
        ?.split("=")[1];
      axios.defaults.headers.common["Authorization"] = token;
      const response = await axios.post(`${API_BASE}/api/user/check`);
      console.log(response.data);
    } catch (error) {
      console.error("Token 驗證失敗：", error.response?.data.message); 
    }
  };

  // #6. 取得產品列表函式 (取得產品資料API)
  const getProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(response.data.products);
    } catch (error) {
      console.error("取得產品列表失敗：", error.response?.data.message);
    }
  };

    return (
      <>
        {!isAuth ? (
          // #1. 登入頁面
          <div className="container login-page">
            <h1>請先登入</h1>
            <form className="form-floating" onSubmit={onSubmit}>
              <div className="form-floating mb-3">
                <input type="email" className="form-control" name="username" placeholder="name@example.com"
                  value={formData.username} onChange={handleInputChange} />
                <label htmlFor="username">Email address</label>
              </div>
              <div className="form-floating mb-3">
                <input type="password" className="form-control" name="password" placeholder="Password"
                  value={formData.password} onChange={handleInputChange} />
                <label htmlFor="password">Password</label>
              </div>
              <button type="submit" className="btn btn-primary w-100 mt-4">登入</button>
            </form>
          </div>
        ) : (
          <div className="container">
            <div className="row mt-4">
              <div className="col-md-6">
                <button type="button"
                  className="btn btn-warning w-100 mt-6 my-3"
                  onClick={checkLogin}>
                  確認是否登入
                </button>
                <h2>產品列表</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col"><h5>產品名稱</h5></th>
                      <th scope="col"><h5>原價</h5></th>
                      <th scope="col"><h5>售價</h5></th>
                      <th scope="col"><h5>是否啟用</h5></th>
                      <th scope="col"><h5>查看細節</h5></th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      products.map(product => (
                        <tr key={product.id}>
                          <th scope="row">{product.title}</th>
                          <td>{product.origin_price}</td>
                          <td>{product.price}</td>
                          <td>{product.is_enabled ? "啟用" : "未啟用"}</td>
                          <td>
                            <button type="button" className="btn btn-success btn-sm"
                              onClick={() => setTempProduct(product)}>查看</button>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
              <div className="col-md-6">
                <h2>產品明細</h2>
                {tempProduct ? (
                  <div className="card">
                    <img src={tempProduct.imageUrl}
                      className="card-img-top mx-auto"
                      style={{ height: "300px", width: "300px" }}
                      alt="mainpic" />
                    <div className="card-body">
                      <h5 className="card-title">{tempProduct.title}</h5>
                      <p className="card-text">
                        商品描述:{tempProduct.description}
                      </p>
                      <p className="card-text">
                        商品內容:{tempProduct.content}
                      </p>
                      <div className="d-flex">
                        <del className="text-secondary">{tempProduct.origin_price}</del> 元/
                        {tempProduct.price} 元
                      </div>
                      <h5 className="card-title">更多圖片</h5>
                      <div className="d-flex flex-wrap">
                        {
                          tempProduct.imagesUrl.map((url, index) => (
                            <img key={index}
                              src={url}
                              style={{ height: "150px", width: "150px", marginRight: "10px" }}
                              alt="smallpic" />
                          ))
                        }
                      </div>
                    </div>
                  </div>
                ) : <p>請點選產品以查看細節</p>}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  export default App;
