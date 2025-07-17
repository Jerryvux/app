# Appcho (Tên đầy đủ hơn nếu có, ví dụ: Ứng dụng Quản lý Sản phẩm & Đơn hàng)

![Android Appcho Screenshot](https://github.com/Jerryvux/app/blob/main/src/assets/Images/appcho.png)

## Giới thiệu

Appcho là một ứng dụng di động được phát triển để hỗ trợ người dùng trong việc duyệt sản phẩm, quản lý đơn hàng và thực hiện các giao dịch cơ bản. Dự án này được phát triển như một phần của quá trình học tập và ứng dụng các kiến thức về phát triển Fullstack với Java Spring Boot (Backend) và React Native (Frontend).

## Tính năng chính

* **Đăng nhập & Đăng ký:** Cho phép người dùng tạo tài khoản và truy cập vào ứng dụng một cách an toàn.
* **Danh sách sản phẩm:** Hiển thị danh sách các sản phẩm với thông tin chi tiết.
* **Chi tiết sản phẩm:** Xem thông tin chi tiết của từng sản phẩm.
* **Quản lý giỏ hàng:** Thêm/bớt sản phẩm vào giỏ hàng.
* **Thanh toán:** Quy trình thanh toán đơn giản.
* **Lịch sử đơn hàng:** Xem lại các đơn hàng đã đặt.

## Công nghệ sử dụng

Dự án này sử dụng kết hợp các công nghệ sau:

### Backend (API)

* **Ngôn ngữ:** Java .
* **Framework:** Spring Boot .
* **Cơ sở dữ liệu:** MySQL .
* **Quản lý dependency:** Maven (hoặc Gradle nếu bạn dùng)
* **Công cụ:** Docker (để đóng gói ứng dụng, nếu bạn đã sử dụng).

### Frontend (Ứng dụng di động)

* **Ngôn ngữ:** JavaScript .
* **Thư viện/Framework:** React Native .
* **Styling:** CSS .
* **Môi trường phát triển:** Node.js, npm/yarn

## Cấu trúc dự án

Dự án được chia thành hai phần chính:
* `shopeeline/`: Chứa mã nguồn của API (Spring Boot).
* `app/`: Chứa mã nguồn của ứng dụng di động (React Native).

## Hướng dẫn cài đặt & Chạy ứng dụng

Để chạy dự án này trên máy local của bạn, vui lòng làm theo các bước sau:

### 1. Chuẩn bị môi trường

* **Java Development Kit (JDK):** Cài đặt JDK 11 trở lên.
* **Node.js & npm/yarn:** Cài đặt Node.js (phiên bản khuyến nghị là LTS) và npm hoặc yarn.
* **MySQL Server:** Cài đặt MySQL và tạo một cơ sở dữ liệu cho dự án (ví dụ: `appcho_db`).
* **Công cụ quản lý CSDL:** Ví dụ: MySQL Workbench, DBeaver, phpMyAdmin.

### 2. Backend Setup

1.  Clone repository này về máy local của bạn:
    ```bash
    git clone [https://github.com/Jerryvux/app.git](https://github.com/Jerryvux/app.git)
    ```
2.  Di chuyển vào thư mục `shopeeline`:
    ```bash
    cd app/shopeeline
    ```
3.  Cập nhật file `src/main/resources/application.properties` (hoặc `application.yml`) với thông tin kết nối cơ sở dữ liệu của bạn:
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/testShopee_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    spring.datasource.username=your_mysql_username
    spring.datasource.password=your_mysql_password
    spring.jpa.hibernate.ddl-auto=update # hoặc none nếu bạn đã có schema
    ```
4.  Build và chạy ứng dụng Spring Boot:
    ```bash
    ./mvn spring-boot:run
    # hoặc nếu bạn dùng Gradle
    # ./gradlew bootRun
    ```
    API sẽ chạy trên cổng mặc định 8080 (hoặc cổng bạn cấu hình).

### 3. Frontend Setup

1.  Di chuyển vào thư mục `appapp`:
    ```bash
    cd ../app
    ```
2.  Cài đặt các dependency:
    ```bash
    npm install
    # hoặc yarn install
    ```
3.  Cập nhật file cấu hình API (nếu có, ví dụ: trong `data/api.j   ```
2.  Di chuyển vào thư mục `shopeeline`:
    ```bash
    cd app/shopeeline
    ```
3.  Cập nhật file `src/main/resources/application.properties` (hoặc `application.yml`) với thông tin kết nối cơ sở dữ liệu của bạn:
    ```properties
    spring.datasource.url=jdbc:mysql://localhost:3306/testShopee_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    spring.datasource.username=your_mysql_username
    spring.datasource.password=your_mysql_password
    spring.jpa.hibernate.ddl-auto=update # hoặc none nếu bạn đã có schema
    ```
4.  Build và chạy ứng dụng Spring Boot:
    ```bash
    ./mvnw spring-boot:run
    # hoặc nếu bạn dùng Gradle
    # ./gradlew bootRun
    ```
    API sẽ chạy trên cổng mặc định 8080 (hoặc cổng bạn cấu hình).

### 3. Frontend Setup

1.  Di chuyển vào thư mục `appapp`:
    ```bash
    cd ../app
    ```
2.  Cài đặt các dependency:
    ```bash
    npm install
    # hoặc yarn install
    ```
3.  Cập nhật file cấu hình API (nếu có, ví dụ: trong `data/api.js` hoặc tương tự) để trỏ đến địa chỉ Backend của bạn (
   ```bash
   http://10.0.2.2:8080` cho Android Emulator,
   http://localhost:8080` cho web hoặc thiết bị thật kết nối cùng mạng).
   ```
5.  Khởi chạy ứng dụng React Native:
    ```bash
    npm start
    # or
    npx react-native run-android # Để chạy trên emulator/thiết bị Android
## Đóng góp

Dự án này được phát triển cá nhân bởi [Vũ Đức Duy](https://github.com/Jerryvux). Mọi ý kiến đóng góp hoặc cải tiến đều được hoan nghênh!

## Liên hệ

Nếu có bất kỳ câu hỏi nào, bạn có thể liên hệ qua:
* Email: jerryvux@gmail.com .
* GitHub: https://github.com/Jerryvux .

---
