import { useState, useEffect, useRef } from 'react'

import * as bootstrap from "bootstrap";
import "./assets/style.css";
import axios from "axios";

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
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [templateProduct, setTemplateProduct] = useState(INITIAL_TEMPLATE_DATA);
  const [modalType, setModalType] = useState('');

  const productModalRef = useRef(null);

  // #3. 表單輸入變更處理函式
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((preData) => ({
      ...preData,
      [name]: value,
    }))  // preData 代表先前的表單資料
  };

  const handleModalInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setTemplateProduct((preData) => ({
      ...preData,
      [name]: type === "checkbox" ? checked : value,
    }))
  };

  const handleModalImageChange = (index, value) => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl];
      newImage[index] = value;

      if (value !== "" && index === newImage.length - 1 && newImage.length < 5) {
        newImage.push("");
      }

      if (value === "" && newImage.length > 1 && newImage[newImage.length - 1] === "") {
        newImage.pop();
      }

      return {
        ...pre,
        imagesUrl: newImage,
      }
    })
  }

  const handleAddImage = () => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl];
      newImage.push('');
      return {
        ...pre,
        imagesUrl: newImage,
      };
    })
  };

  const handleRemoveImage = () => {
    setTemplateProduct((pre) => {
      const newImage = [...pre.imagesUrl];
      newImage.pop();
      return {
        ...pre,
        imagesUrl: newImage,
      };
    })
  };


  const updateProduct = async (id) => {
    let url = `${API_BASE}/api/${API_PATH}/admin/product`;
    let method = 'post';

    if (modalType === "edit" && id) {
      url = `${API_BASE}/api/${API_PATH}/admin/product/${id}`;
      method = "put";
    }

    const productData = {
      data: {
        ...templateProduct,
        origin_price: Number(templateProduct.origin_price),
        price: Number(templateProduct.price),
        is_enabled: templateProduct.is_enabled ? 1 : 0,
        imagesUrl: [...templateProduct.imagesUrl.filter(url => url !== "")],
      },
    };

    try {
      const response = await axios[method](url, productData);
      console.log(response.data);
      getProducts();
      closeProductModal();
    } catch (error) {
      console.log(error.response);

    }

  }

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
  const getProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(response.data.products);
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

  const deleteProduct = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${id}`);
      getProducts();
      closeProductModal();
    } catch (error) {
      console.log(error.response);
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
        </div>
      )}

      <div className="modal fade" id="productModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true" ref={productModalRef}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className={`modal-header bg-${modalType === "delete" ? "danger" : "dark"} text-white`}>
              <h5 id="productModalLabel" className="modal-title">
                <span>{modalType === "delete" ? "刪除" :
                  modalType === "edit" ? "編輯" : "新增"}產品</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {
                modalType === "delete" ? (
                  <p className="fs-4">
                    確定要刪除
                    <span className="text-danger">{templateProduct.title}</span>嗎？
                  </p>) : (
                  <div className="row">
                    <div className="col-sm-4">
                      <div className="mb-2">
                        <div className="mb-3">
                          <label htmlFor="imageUrl" className="form-label">
                            輸入圖片網址
                          </label>
                          <input
                            type="text"
                            id="imageUrl"
                            name="imageUrl"
                            className="form-control"
                            placeholder="請輸入圖片連結"
                            value={templateProduct.imageUrl}
                            onChange={(e) => handleModalInputChange(e)}
                          />
                        </div>
                        {
                          templateProduct.imageUrl && (
                            <img className="img-fluid" src={templateProduct.imageUrl} alt="主圖" />
                          )
                        }
                      </div>
                      <div>
                        {
                          templateProduct.imagesUrl.map((url, index) => (
                            <div key={index}>
                              <label htmlFor="imageUrl" className="form-label">
                                輸入圖片網址
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                placeholder={`圖片網址${index + 1}`}
                                value={url}
                                onChange={(e) => handleModalImageChange(index, e.target.value)}
                              />
                              {
                                url &&
                                <img
                                  className="img-fluid"
                                  src={url}
                                  alt={`副圖${index + 1}`}
                                />
                              }
                            </div>
                          ))
                        }
                        {
                          templateProduct.imagesUrl.length < 5 &&
                          templateProduct.imagesUrl[templateProduct.imagesUrl.length - 1] !== "" &&
                          <button className="btn btn-outline-primary btn-sm d-block w-100"
                            onClick={() => handleAddImage()}>
                            新增圖片
                          </button>
                        }
                      </div>
                      <div>
                        {
                          templateProduct.imagesUrl.length >= 1 &&
                          <button className="btn btn-outline-danger btn-sm d-block w-100"
                            onClick={() => handleRemoveImage()}>
                            刪除圖片
                          </button>
                        }
                      </div>
                    </div>
                    <div className="col-sm-8">
                      <div className="mb-3">
                        <label htmlFor="title" className="form-label">標題</label>
                        <input
                          name="title"
                          id="title"
                          type="text"
                          className="form-control"
                          placeholder="請輸入標題"
                          value={templateProduct.title}
                          onChange={(e) => handleModalInputChange(e)}
                          // disabled={modalType === "edit"} // 編輯模式下標題不可更改
                        />
                      </div>

                      <div className="row">
                        <div className="mb-3 col-md-6">
                          <label htmlFor="category" className="form-label">分類</label>
                          <input
                            name="category"
                            id="category"
                            type="text"
                            className="form-control"
                            placeholder="請輸入分類"
                            value={templateProduct.category}
                            onChange={(e) => handleModalInputChange(e)}
                          />
                        </div>
                        <div className="mb-3 col-md-6">
                          <label htmlFor="unit" className="form-label">單位</label>
                          <input
                            name="unit"
                            id="unit"
                            type="text"
                            className="form-control"
                            placeholder="請輸入單位"
                            value={templateProduct.unit}
                            onChange={(e) => handleModalInputChange(e)}
                          />
                        </div>
                      </div>

                      <div className="row">
                        <div className="mb-3 col-md-6">
                          <label htmlFor="origin_price" className="form-label">原價</label>
                          <input
                            name="origin_price"
                            id="origin_price"
                            type="number"
                            min="0"
                            className="form-control"
                            placeholder="請輸入原價"
                            value={templateProduct.origin_price}
                            onChange={(e) => handleModalInputChange(e)}
                          />
                        </div>
                        <div className="mb-3 col-md-6">
                          <label htmlFor="price" className="form-label">售價</label>
                          <input
                            name="price"
                            id="price"
                            type="number"
                            min="0"
                            className="form-control"
                            placeholder="請輸入售價"
                            value={templateProduct.price}
                            onChange={(e) => handleModalInputChange(e)}
                          />
                        </div>
                      </div>
                      <hr />

                      <div className="mb-3">
                        <label htmlFor="description" className="form-label">產品描述</label>
                        <textarea
                          name="description"
                          id="description"
                          className="form-control"
                          placeholder="請輸入產品描述"
                          value={templateProduct.description}
                          onChange={(e) => handleModalInputChange(e)}
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="content" className="form-label">說明內容</label>
                        <textarea
                          name="content"
                          id="content"
                          className="form-control"
                          placeholder="請輸入說明內容"
                          value={templateProduct.content}
                          onChange={(e) => handleModalInputChange(e)}
                        ></textarea>
                      </div>
                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            name="is_enabled"
                            id="is_enabled"
                            className="form-check-input"
                            type="checkbox"
                            checked={templateProduct.is_enabled}
                            onChange={(e) => handleModalInputChange(e)}
                          />
                          <label className="form-check-label" htmlFor="is_enabled">
                            是否啟用
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )

              }

            </div>
            <div className="modal-footer">
              {
                modalType === "delete" ? (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => deleteProduct(templateProduct.id)}
                  >
                    刪除
                  </button>
                ) : (<>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    data-bs-dismiss="modal"
                    onClick={() => closeProductModal()}
                  >
                    取消
                  </button>
                  <button type="button" className="btn btn-primary"
                    onClick={() => updateProduct(templateProduct.id)}
                  >確認</button>
                </>
                )
              }
            </div>
          </div>
        </div>
      </div>

    </>
  );
}

export default App;
