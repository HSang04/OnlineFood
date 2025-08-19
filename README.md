\# 🍔 OnlineFood - Website đặt món ăn trực tuyến



\## 📖 Giới thiệu

\*\*OnlineFood\*\* là website cho phép người dùng đặt món ăn trực tuyến, quản lý giỏ hàng, thanh toán, và theo dõi tình trạng đơn hàng.  

Hệ thống cung cấp \*\*trang quản trị\*\* dành cho Admin/Quản lý để quản lý món ăn, người dùng và đơn hàng.  



👉 Đây là dự án \*\*cá nhân\*\* nhằm rèn luyện kỹ năng \*\*Fullstack với ReactJS \& Spring Boot\*\*.



---



\## ✨ Tính năng nổi bật



\### 👤 Người dùng

\- Đăng ký / Đăng nhập tài khoản  

\- Xem menu và chi tiết món ăn  

\- Thêm / chỉnh sửa / xóa món trong giỏ hàng  

\- Áp dụng voucher giảm giá  

\- Thanh toán trực tuyến  

\- Theo dõi trạng thái đơn hàng  



\### 🔑 Quản trị (Admin/Quản lý)

\- Quản lý người dùng  

\- Quản lý món ăn (thêm/sửa/xóa, upload ảnh lên Cloudinary)  

\- Quản lý đơn hàng và tình trạng giao hàng  

\- Quản lý voucher/khuyến mãi  



---



\## 🛠️ Công nghệ sử dụng

\- \*\*Frontend:\*\* ReactJS  

\- \*\*Backend:\*\* Spring Boot, Spring Security (JWT)  

\- \*\*Database:\*\* MySQL  

\- \*\*Khác:\*\* Cloudinary (lưu trữ hình ảnh)  



---



\## 📂 Cấu trúc dự án

```bash

OnlineFood/

│── backend/              # Spring Boot (REST API, Security, MySQL)

│   ├── src/main/java/    # Source code Java

│   ├── src/main/resources/

│   │   └── application.properties

│   └── pom.xml           # Maven build file

│

│── frontend/             # ReactJS (UI cho người dùng \& admin)

│   ├── public/

│   ├── src/

│   └── package.json

│

│── database/             # File SQL khởi tạo CSDL

│   └── restaurantdb.sql

│

│── README.md             # Tài liệu dự án





Hướng dẫn cài đặt

🔹 Backend (Spring Boot)



Clone project:



git clone https://github.com/HSang04/OnlineFood.git

cd OnlineFood/backend





Tạo database trong MySQL:



CREATE DATABASE restaurantdb;





Cấu hình MySQL trong src/main/resources/application.properties:



spring.datasource.url=jdbc:mysql://localhost:3306/restaurantdb

spring.datasource.username=root

spring.datasource.password=your\_password

spring.jpa.hibernate.ddl-auto=update

spring.jpa.show-sql=true





Chạy project Spring Boot:



mvn spring-boot:run





👉 Server chạy tại: http://localhost:8080


Frontend (ReactJS)



Vào thư mục frontend:



cd ../frontend





Cài đặt dependencies:



npm install





Chạy ứng dụng React:



npm start





👉 Giao diện chạy tại: http://localhost:3000


📌 Thông tin



👨‍💻 Tác giả: HSang04



🔗 GitHub: https://github.com/HSang04



📧 Email: huynhsang2004a@gmail.com

