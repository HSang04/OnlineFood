import axios from "axios";
import React, { useEffect, useState } from "react";
import "./Profile.css";

const Profile = () => {
  const [user, setUser] = useState(null);
  const idNguoiDung = localStorage.getItem("idNguoiDung");
   const jwt = localStorage.getItem("jwt");

  useEffect(() => {
    if (!idNguoiDung || !jwt) return;

    axios.get(`http://localhost:8080/api/nguoi-dung/${idNguoiDung}`, {
      headers: {
        Authorization: `Bearer ${jwt}`, 
      },
    })
    .then((response) => {
      setUser(response.data);
    })
    .catch((error) => {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    });
  }, [idNguoiDung, jwt]);

  if (!user) return <p>Đang tải...</p>;

 return (
  <div className="profile-container">
    <h2>Thông tin cá nhân</h2>
    <p><strong>Họ tên:</strong> {user.hoTen}</p>
    <p><strong>Email:</strong> {user.email}</p>
    <p><strong>Số điện thoại:</strong> {user.soDienThoai}</p>
    <p><strong>Địa chỉ:</strong> {user.diaChi}</p>
    <p><strong>Vai trò:</strong> {user.vaiTro}</p>
    <p><strong>Ngày tạo:</strong> {new Date(user.ngayTao).toLocaleString()}</p>
  </div>
);
};

export default Profile;
