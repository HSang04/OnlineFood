-- ENUM ROLE TEST
CREATE TABLE user_role_enum (
    role ENUM('ADMIN','QUANLY','NHANVIEN_QUANLYDONHANG','NHANVIEN_QUANLYMONAN','KHACHHANG') PRIMARY KEY
);

-- NGUOI_DUNG
CREATE TABLE nguoi_dung (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ho_ten VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mat_khau VARCHAR(255) NOT NULL,
    so_dien_thoai VARCHAR(20),
    dia_chi VARCHAR(255),
    vai_tro ENUM('ADMIN','QUANLY','NHANVIEN_XACNHAN','NHANVIEN_MONAN','KHACHHANG') NOT NULL,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- DANH_MUC
CREATE TABLE danh_muc (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ten_danh_muc VARCHAR(100) NOT NULL
);

-- MON_AN
CREATE TABLE mon_an (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ten_mon_an VARCHAR(100) NOT NULL,
    mo_ta TEXT,
    gia DECIMAL(10,2) NOT NULL,
    hinh_anh VARCHAR(255),
    id_danh_muc BIGINT,
    FOREIGN KEY (id_danh_muc) REFERENCES danh_muc(id)
);

-- VOUCHER
CREATE TABLE voucher (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ma_voucher VARCHAR(50) NOT NULL,
    loai ENUM('PHAN_TRAM','TIEN_MAT') NOT NULL,
    gia_tri DECIMAL(10,2) NOT NULL,
    han_su_dung DATE NOT NULL
);

-- DON_HANG
CREATE TABLE don_hang (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_nguoi_dung BIGINT,
    ngay_tao DATETIME DEFAULT CURRENT_TIMESTAMP,
    trang_thai ENUM('CHO_XAC_NHAN','DANG_GIAO','HOAN_THANH','DA_HUY') DEFAULT 'CHO_XAC_NHAN',
    id_voucher BIGINT,
    FOREIGN KEY (id_nguoi_dung) REFERENCES nguoi_dung(id),
    FOREIGN KEY (id_voucher) REFERENCES voucher(id)
);

-- CHI_TIET_DON_HANG
CREATE TABLE chi_tiet_don_hang (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_don_hang BIGINT,
    id_mon_an BIGINT,
    so_luong INT,
    don_gia DECIMAL(10,2),
    FOREIGN KEY (id_don_hang) REFERENCES don_hang(id),
    FOREIGN KEY (id_mon_an) REFERENCES mon_an(id)
);

-- HOA_DON
CREATE TABLE hoa_don (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_don_hang BIGINT,
    ngay_thanh_toan DATETIME,
    tong_tien DECIMAL(10,2),
    phuong_thuc VARCHAR(50),
    FOREIGN KEY (id_don_hang) REFERENCES don_hang(id)
);

-- DANH_GIA_MON_AN
CREATE TABLE danh_gia_mon_an (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_nguoi_dung BIGINT,
    id_mon_an BIGINT,
    so_sao INT CHECK (so_sao BETWEEN 1 AND 5),
    noi_dung TEXT,
    ngay_danh_gia DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoi_dung) REFERENCES nguoi_dung(id),
    FOREIGN KEY (id_mon_an) REFERENCES mon_an(id)
);

-- DANH_GIA_NHA_HANG
CREATE TABLE danh_gia_nha_hang (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_nguoi_dung BIGINT,
    so_sao INT CHECK (so_sao BETWEEN 1 AND 5),
    noi_dung TEXT,
    ngay_danh_gia DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_nguoi_dung) REFERENCES nguoi_dung(id)
);


-- USERS
INSERT INTO nguoi_dung (ho_ten, email, mat_khau, so_dien_thoai, dia_chi, vai_tro) VALUES
('Admin', 'admin', '123456', '0909123456', '123 Trần Hưng Đạo', 'ADMIN'),
('Khách A', 'user', '123456', '0909333444', '456 Lý Thường Kiệt', 'KHACHHANG');

-- DANH MỤC
INSERT INTO danh_muc (ten_danh_muc) VALUES ('Đồ ăn nhanh'), ('Thức uống');

-- MON AN
INSERT INTO mon_an (ten_mon_an, mo_ta, gia, hinh_anh, id_danh_muc) VALUES
('Burger Bò', 'Burger thịt bò ngon', 50000, 'burger.jpg', 1),
('Trà sữa trân châu', 'Thức uống mát lạnh', 30000, 'trasua.jpg', 2);

-- VOUCHER
INSERT INTO voucher (ma_voucher, loai, gia_tri, han_su_dung) VALUES
('SALE10', 'PHAN_TRAM', 10, '2025-12-31'),
('GIAM50K', 'TIEN_MAT', 50000, '2025-12-31');

-- DON HANG
INSERT INTO don_hang (id_nguoi_dung, trang_thai, id_voucher) VALUES (2, 'HOAN_THANH', 1);

-- CHI TIET
INSERT INTO chi_tiet_don_hang (id_don_hang, id_mon_an, so_luong, don_gia) VALUES
(1, 1, 2, 50000),
(1, 2, 1, 30000);

-- HOA DON
INSERT INTO hoa_don (id_don_hang, ngay_thanh_toan, tong_tien, phuong_thuc) VALUES
(1, NOW(), 118000, 'MOMO');

-- DANH GIA MON AN
INSERT INTO danh_gia_mon_an (id_nguoi_dung, id_mon_an, so_sao, noi_dung) VALUES
(2, 1, 5, 'Rất ngon');

-- DANH GIA NHA HANG
INSERT INTO danh_gia_nha_hang (id_nguoi_dung, so_sao, noi_dung) VALUES
(2, 4, 'Phục vụ nhanh, món ăn ngon');
