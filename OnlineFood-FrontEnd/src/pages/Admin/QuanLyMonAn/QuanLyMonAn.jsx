import React, { useEffect, useState } from "react";
import axios from "../../../services/axiosInstance";
import { useNavigate } from "react-router-dom";
import './QuanLyMonAn.css';

const QuanLyMonAn = () => {
  const [dsMonAn, setDsMonAn] = useState([]);
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await axios.get('/mon-an');
      setDsMonAn(res.data);
    } catch (err) {
      console.error("Lỗi lấy danh sách món ăn:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const timKiem = async () => {
    try {
      const res = await axios.get(`/mon-an/search?keyword=${keyword}`);
      setDsMonAn(res.data);
    } catch (err) {
      console.error("Lỗi tìm kiếm", err);
    }
  };

  const xoaMonAn = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa?")) {
      try {
        await axios.delete(`/mon-an/${id}`);
        fetchData();
      } catch (err) {
        console.error("Lỗi xóa món ăn", err);
      }
    }
  };

  return (
    <div className="monan-container">
      <h2 className="title">Quản lý món ăn</h2>
      <div className="search-bar">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm kiếm món ăn..."
          className="search-input"
        />
        <button onClick={timKiem} className="btn btn-search">Tìm</button>
        <button onClick={() => navigate("/them-sua-mon-an")} className="btn btn-add">Thêm món ăn</button>
      </div>
      <table className="monan-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên món</th>
            <th>Ảnh</th>
            <th>Giá</th>
            <th>Mô tả</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {dsMonAn.map((mon) => (
            <tr key={mon.id}>
              <td>{mon.id}</td>
              <td>{mon.tenMonAn}</td>
              <td>
                {mon.hinhAnhMonAns?.length > 0 ? (
                  <img
                    src={mon.hinhAnhMonAns[0].duongDan}
                    alt="Ảnh món ăn"
                    className="monan-img"
                  />
                ) : (
                  <span className="no-img">Không có ảnh</span>
                )}
              </td>
              <td>{mon.gia.toLocaleString()} đ</td>
              <td>{mon.moTa}</td>
              <td>
                <button
                  onClick={() => navigate(`/them-sua-mon-an/${mon.id}`)}
                  className="btn btn-edit"
                >
                  Sửa
                </button>
                <button
                  onClick={() => xoaMonAn(mon.id)}
                  className="btn btn-delete"
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuanLyMonAn;
