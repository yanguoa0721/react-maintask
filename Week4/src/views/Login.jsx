import { useState } from 'react';
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;


function Login({ getProducts, setIsAuth }) {

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

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


    return (

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
    )
}

export default Login;