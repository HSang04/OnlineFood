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
  const [images, setImages] = useState([]); // Ảnh mới được chọn
  const [previews, setPreviews] = useState([]); // Preview ảnh mới
  const [oldImages, setOldImages] = useState([]); // Ảnh cũ từ DB
  const [originalImages, setOriginalImages] = useState([]); // Lưu ảnh gốc để khôi phục
  const [deletedImageIds, setDeletedImageIds] = useState([]); // ID các ảnh cần xóa
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDanhMucs = async () => {
      try {
        const res = await axios.get('/danh-muc', {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        setDanhMucs(res.data);
      } catch (err) {
        console.error('Lỗi khi lấy danh mục:', err);
        setError('Không thể tải danh mục');
      }
    };

    fetchDanhMucs();
  }, [jwt]);

  useEffect(() => {
    if (id) {
      const fetchMonAn = async () => {
        setLoading(true);
        try {
          const res = await axios.get(`/mon-an/${id}`, {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          const monAn = res.data;
          setForm({
            tenMonAn: monAn.tenMonAn || '',
            gia: monAn.gia || '',
            moTa: monAn.moTa || '',
            danhMuc: monAn.danhMuc?.id || '',
          });
          // Đảm bảo oldImages là một mảng và có đầy đủ thông tin
          const images = monAn.hinhAnhMonAns || [];
          setOldImages(images);
          setOriginalImages(images); // Lưu bản sao gốc để khôi phục
        } catch (err) {
          console.error('Lỗi khi tải món ăn:', err);
          setError('Không thể tải thông tin món ăn');
        } finally {
          setLoading(false);
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
    setError(''); // Clear error khi user nhập liệu
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImages((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveNewImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleRemoveOldImage = (imageId) => {
    // Thêm vào danh sách xóa thay vì xóa ngay lập tức
    setDeletedImageIds(prev => [...prev, imageId]);
    setOldImages(prevImages => prevImages.filter(img => img.id !== imageId));
  };

  const handleRestoreOldImage = (imageId) => {
    // Khôi phục ảnh đã đánh dấu xóa
    setDeletedImageIds(prev => prev.filter(id => id !== imageId));
    const imageToRestore = originalImages.find(img => img.id === imageId);
    if (imageToRestore) {
      setOldImages(prev => [...prev, imageToRestore]);
    }
  };



  const handleClearAllImages = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả ảnh không?')) {
      setImages([]);
      if (oldImages.length > 0) {
        setDeletedImageIds(oldImages.map(img => img.id));
        setOldImages([]);
      }
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    // Tạo danh sách keptImageIds: ảnh cũ chưa bị người dùng xóa
    const keptImageIds = oldImages.map(img => img.id);

    const monAnData = {
      tenMonAn: form.tenMonAn,
      gia: parseFloat(form.gia),
      moTa: form.moTa,
      danhMuc: { id: parseInt(form.danhMuc) },
      keptImageIds: keptImageIds, // gửi danh sách ảnh giữ lại
    };

    const formData = new FormData();
    formData.append("monAn", JSON.stringify(monAnData));

    // Thêm ảnh mới
    images.forEach((img) => {
      formData.append("images", img);
    });

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
    setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu món ăn');
  } finally {
    setLoading(false);
  }
};


  if (loading && id) {
    return (
      <div className="them-sua-mon-an">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="them-sua-mon-an">
      <h2>{id ? 'Sửa' : 'Thêm'} Món Ăn</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

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
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label>Mô tả:</label>
          <textarea
            name="moTa"
            value={form.moTa}
            onChange={handleChange}
            rows="4"
          />
        </div>

        {/* Hiển thị ảnh cũ */}
        {oldImages.length > 0 && (
          <div className="image-section">
            <label>Ảnh hiện tại ({oldImages.length} ảnh):</label>
            <div className="preview-container">
              {oldImages.map((img, index) => (
                <div key={img.id || index} className="preview-image-wrapper old-image">
                  <img 
                    src={img.duongDan} 
                    alt={`Ảnh ${index + 1}`} 
                    className="preview-image" 
                    onError={(e) => {
                      e.target.src = '/placeholder-image.jpg'; // Ảnh placeholder nếu lỗi
                    }}
                  />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveOldImage(img.id)}
                    title="Xóa ảnh này"
                  >
                    ×
                  </button>
                  <div className="image-label">Ảnh cũ</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hiển thị ảnh đã bị xóa */}
        {deletedImageIds.length > 0 && (
          <div className="image-section deleted-images">
            <label>Ảnh sẽ bị xóa ({deletedImageIds.length} ảnh):</label>
            <div className="preview-container">
              {deletedImageIds.map((imageId) => {
                const deletedImage = originalImages.find(img => img.id === imageId);
                return deletedImage ? (
                  <div key={imageId} className="preview-image-wrapper deleted-image">
                    <img 
                      src={deletedImage.duongDan} 
                      alt="Ảnh sẽ xóa" 
                      className="preview-image deleted" 
                    />
                    <button
                      type="button"
                      className="restore-btn"
                      onClick={() => handleRestoreOldImage(imageId)}
                      title="Khôi phục ảnh này"
                    >
                      ↶
                    </button>
                    <div className="image-label">Sẽ xóa</div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Hiển thị ảnh mới */}
        <div className="image-section">
          <label>
            Thêm ảnh mới (có thể chọn nhiều):
            {images.length > 0 && ` (${images.length} ảnh đã chọn)`}
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
          
          {previews.length > 0 && (
            <div className="preview-container">
              {previews.map((src, index) => (
                <div key={index} className="preview-image-wrapper new-image">
                  <img src={src} alt={`Ảnh mới ${index + 1}`} className="preview-image" />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => handleRemoveNewImage(index)}
                    title="Xóa ảnh này"
                  >
                    ×
                  </button>
                  <div className="image-label">Ảnh mới</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nút xóa tất cả ảnh */}
        {(images.length > 0 || oldImages.length > 0) && (
          <div className="image-actions">
            <button
              type="button"
              className="clear-all-btn"
              onClick={handleClearAllImages}
            >
              Xóa tất cả ảnh
            </button>
          </div>
        )}

        {/* Thông tin tổng số ảnh */}
        <div className="image-summary">
          <p>
            <strong>Sau khi cập nhật sẽ có:</strong> {oldImages.length + images.length} ảnh
            {oldImages.length > 0 && (
              <span className="current-count"> ({oldImages.length} ảnh hiện tại</span>
            )}
            {images.length > 0 && (
              <span className="new-count"> + {images.length} ảnh mới</span>
            )}
            {(oldImages.length > 0 || images.length > 0) && <span>)</span>}
            {deletedImageIds.length > 0 && (
              <span className="deleted-count"> - {deletedImageIds.length} ảnh đã xóa</span>
            )}
          </p>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={loading ? "loading" : ""}
        >
          {loading ? 'Đang xử lý...' : (id ? 'Cập nhật' : 'Thêm mới')}
        </button>
      </form>
    </div>
  );
};

export default ThemSuaMonAn;