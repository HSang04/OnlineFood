import React, { useEffect, useState } from 'react';
import axios from "../../../services/axiosInstance";
import { useNavigate, useParams } from 'react-router-dom';
import './ThemSuaMonAn.css';

const ThemSuaMonAn = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const jwt = localStorage.getItem('jwt');

  const [form, setForm] = useState({
    tenMonAn: '',
    gia: '',
    moTa: '',
    danhMuc: '',
  });

  const [danhMucs, setDanhMucs] = useState([]);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    const fetchDanhMucs = async () => {
      try {
        const res = await axios.get('/danh-muc', {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        setDanhMucs(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy danh mục:', err);
      }
    };

    fetchDanhMucs();
  }, [jwt]);

  useEffect(() => {
    if (id) {
      const fetchMonAn = async () => {
        try {
          const res = await axios.get(`/mon-an/${id}`, {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          const monAn = res.data;
          setForm({
            tenMonAn: monAn.tenMonAn,
            gia: monAn.gia,
            moTa: monAn.moTa,
            danhMuc: monAn.danhMuc?.id || '',
          });
        } catch (err) {
          console.error('Lỗi khi tải món ăn:', err);
        }
      };
      fetchMonAn();
    }
  }, [id, jwt]);

  useEffect(() => {
    const imageUrls = images.map((file) => URL.createObjectURL(file));
    setPreviews(imageUrls);

    return () => {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
   
   const monAnData = {
    tenMonAn: form.tenMonAn,
    gia: form.gia,
    moTa: form.moTa,
    danhMuc: { id: parseInt(form.danhMuc) }, 
    };
    const formData = new FormData();
    formData.append("monAn", JSON.stringify(monAnData)); 

    images.forEach((img) => {
      formData.append("images", img); 
    });

 
    // for (let pair of formData.entries()) {
    //   console.log(pair[0] + ':', pair[1]);
    // }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${jwt}`,
      },
    };

    if (id) {
      await axios.put(`/mon-an/${id}`, formData, config);
    } else {
      await axios.post("/mon-an", formData, config);
    }

    navigate("/quan-ly-mon-an");
  } catch (err) {
    console.error("Lỗi khi lưu món ăn:", err);
  }
};



  return (
    <div className="them-sua-mon-an">
      <h2>{id ? 'Sửa' : 'Thêm'} Món Ăn</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div>
          <label>Tên món:</label>
          <input
            type="text"
            name="tenMonAn"
            value={form.tenMonAn}
            onChange={handleChange}
            required
          />
        </div>

             <div>
          <label>Danh mục:</label>
          <select
            name="danhMuc"
            value={form.danhMuc}
            onChange={handleChange}
            required
          >
            <option value="">-- Chọn danh mục --</option>
            {danhMucs.map((dm) => (
              <option key={dm.id} value={dm.id}>
                {dm.tenDanhMuc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Giá:</label>
          <input
            type="number"
            name="gia"
            value={form.gia}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Mô tả:</label>
          <textarea
            name="moTa"
            value={form.moTa}
            onChange={handleChange}
          />
        </div>

   

        <div>
          <label>Ảnh món ăn (có thể chọn nhiều):</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
          <div className="preview-container">
            {previews.map((src, index) => (
              <div key={index} className="preview-image-wrapper">
                <img src={src} alt={`preview-${index}`} className="preview-image" />
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveImage(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit">{id ? 'Cập nhật' : 'Thêm mới'}</button>
      </form>
    </div>
  );
};

export default ThemSuaMonAn;