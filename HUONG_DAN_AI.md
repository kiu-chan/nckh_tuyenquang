# Hướng Dẫn Sử Dụng Tính Năng Tạo Đề Thi Bằng AI

## 🎯 Tổng Quan

Hệ thống tạo đề thi tự động sử dụng **Google Gemini AI** - một mô hình ngôn ngữ lớn (LLM) miễn phí và mạnh mẽ, hỗ trợ tiếng Việt xuất sắc.

## 📋 Yêu Cầu

- Node.js và npm đã được cài đặt
- Kết nối Internet
- Google Gemini API Key (miễn phí)

## 🔑 Bước 1: Lấy Google Gemini API Key (MIỄN PHÍ)

### Cách lấy API Key:

1. **Truy cập trang Google AI Studio:**
   - Mở trình duyệt và truy cập: https://makersuite.google.com/app/apikey
   - Hoặc: https://aistudio.google.com/app/apikey

2. **Đăng nhập Google:**
   - Đăng nhập bằng tài khoản Google của bạn
   - Chấp nhận điều khoản sử dụng nếu được yêu cầu

3. **Tạo API Key:**
   - Nhấn nút **"Create API Key"** hoặc **"Get API key"**
   - Chọn một Google Cloud Project (hoặc tạo project mới)
   - API Key sẽ được tạo tự động

4. **Sao chép API Key:**
   - Nhấn nút **Copy** để sao chép API key
   - API key có dạng: `AIzaSy...` (khoảng 39 ký tự)
   - ⚠️ **LƯU Ý**: Giữ API key này bảo mật, không chia sẻ công khai

### Giới Hạn Miễn Phí:

- ✅ **60 requests/phút** - Đủ để sử dụng trong giáo dục
- ✅ **1500 requests/ngày** (tùy vùng)
- ✅ **Không cần thẻ tín dụng**
- ✅ **Miễn phí vĩnh viễn** cho mức sử dụng hợp lý

## ⚙️ Bước 2: Cấu Hình API Key

### Cách 1: Thông qua file `.env` (Khuyến nghị)

1. **Mở file `.env`** trong thư mục gốc dự án:
   ```bash
   # Nếu dùng VSCode
   code .env

   # Hoặc dùng bất kỳ text editor nào
   ```

2. **Thêm API Key vào file `.env`:**
   ```env
   VITE_GEMINI_API_KEY=AIzaSy...your_actual_api_key_here
   ```

   **Ví dụ:**
   ```env
   VITE_GEMINI_API_KEY=AIzaSyDxKL4JhN9Vm8Xp2Qr3Ts5Uv6Wx7Yz8A9B
   ```

3. **Lưu file** và **khởi động lại server**:
   ```bash
   npm run dev
   ```

### Cách 2: Thông qua biến môi trường hệ thống

**MacOS/Linux:**
```bash
export VITE_GEMINI_API_KEY="your_api_key_here"
npm run dev
```

**Windows (CMD):**
```cmd
set VITE_GEMINI_API_KEY=your_api_key_here
npm run dev
```

**Windows (PowerShell):**
```powershell
$env:VITE_GEMINI_API_KEY="your_api_key_here"
npm run dev
```

## 🚀 Bước 3: Sử Dụng Tính Năng

### 1. Truy cập trang Quản lý Đề Thi

- Đăng nhập với tài khoản giáo viên
- Vào mục **"Quản lý đề thi"**
- Nhấn nút **"Tạo đề thi mới"**

### 2. Chọn phương thức "Tạo bằng AI"

- Trong modal tạo đề thi, chọn **"Tạo bằng AI"**
- Điền thông tin cơ bản:
  - Môn học (VD: Toán học, Vật lý...)
  - Loại đề (Trắc nghiệm, Tự luận, hoặc Hỗn hợp)
  - Độ khó (Dễ, Trung bình, Khó)

### 3. Cung cấp tài liệu

**Cách 1: Upload file text (.txt)**
- Nhấn vào khu vực upload
- Chọn file `.txt` chứa nội dung bài học
- Hiện tại chỉ hỗ trợ file text thuần túy

**Cách 2: Copy-paste nội dung**
- Copy nội dung từ tài liệu (Word, PDF, website...)
- Paste vào ô nhập liệu

### 4. Tùy chỉnh (Tùy chọn)

- **Thêm chủ đề cụ thể**: VD: "Hàm số bậc 2", "Phương trình bậc nhất"
- **Số lượng câu hỏi**:
  - Trắc nghiệm: 1-50 câu
  - Tự luận: 1-20 câu

### 5. Tạo câu hỏi

- Nhấn nút **"Tạo câu hỏi với AI"**
- Đợi AI xử lý (thường 10-30 giây)
- Xem trước các câu hỏi được tạo

### 6. Chỉnh sửa và Lưu

- Xem lại từng câu hỏi
- Xóa câu hỏi không phù hợp
- Nhấn **"Lưu đề thi"** để hoàn tất

## 📝 Định Dạng Câu Hỏi AI Tạo

### Câu hỏi Trắc Nghiệm:
- 4 đáp án (A, B, C, D)
- 1 đáp án đúng
- Giải thích cho đáp án đúng
- Phân loại theo chủ đề
- Điểm số cho mỗi câu

### Câu hỏi Tự Luận:
- Câu hỏi mở
- Đáp án mẫu chi tiết
- Tiêu chí chấm điểm
- Phân loại theo chủ đề
- Điểm số cho mỗi câu

## 🔧 Xử Lý Lỗi Thường Gặp

### Lỗi: "Không thể tạo câu hỏi. Vui lòng thử lại."

**Nguyên nhân:**
- API key chưa được cấu hình
- API key không hợp lệ
- Hết quota miễn phí trong ngày
- Lỗi kết nối Internet

**Giải pháp:**
1. Kiểm tra file `.env` có chứa `VITE_GEMINI_API_KEY`
2. Kiểm tra API key có đúng format không
3. Restart server: `npm run dev`
4. Kiểm tra kết nối Internet
5. Đợi một lúc nếu đã dùng hết quota

### Lỗi: "Vui lòng nhập nội dung hoặc upload file"

**Giải pháp:**
- Đảm bảo đã upload file hoặc paste nội dung vào ô nhập liệu
- Kiểm tra nội dung không để trống

### Lỗi: "Hiện tại chỉ hỗ trợ file .txt"

**Giải pháp:**
- Chuyển đổi file PDF/DOCX sang text
- Hoặc copy nội dung và paste vào ô nhập liệu

## 💡 Mẹo Sử Dụng

### Để có câu hỏi chất lượng cao:

1. **Cung cấp tài liệu rõ ràng:**
   - Nội dung có cấu trúc tốt
   - Thông tin đầy đủ, chính xác
   - Tránh nội dung quá ngắn (< 200 từ)

2. **Chọn độ khó phù hợp:**
   - **Dễ**: Câu hỏi nhận biết, hiểu cơ bản
   - **Trung bình**: Vận dụng kiến thức
   - **Khó**: Phân tích, tổng hợp, sáng tạo

3. **Thêm chủ đề cụ thể:**
   - Giúp AI tập trung vào nội dung quan trọng
   - VD: "Định lý Pythagoras", "Quy tắc cộng vector"

4. **Xem lại và chỉnh sửa:**
   - AI có thể tạo câu hỏi không hoàn hảo
   - Luôn kiểm tra lại trước khi sử dụng

## 🎓 Ví Dụ Thực Tế

### Ví dụ 1: Tạo đề kiểm tra Toán 10

```
Môn học: Toán học
Loại đề: Trắc nghiệm
Độ khó: Trung bình
Số câu: 20

Nội dung tài liệu:
[Paste nội dung chương "Hàm số bậc 2" từ SGK Toán 10]

Chủ đề: Hàm số bậc 2, Đồ thị parabol, Tìm cực trị

→ AI sẽ tạo 20 câu hỏi trắc nghiệm về hàm số bậc 2
```

### Ví dụ 2: Tạo đề tự luận Vật lý

```
Môn học: Vật lý
Loại đề: Tự luận
Độ khó: Khó
Số câu: 5

Nội dung tài liệu:
[Paste nội dung chương "Động lực học chất điểm" từ SGK Vật lý 10]

Chủ đề: Định luật Newton, Lực ma sát, Chuyển động ném xiên

→ AI sẽ tạo 5 câu hỏi tự luận có đáp án mẫu và tiêu chí chấm
```

## 📊 Tính Năng Trong Tương Lai

- [ ] Hỗ trợ upload file PDF, DOCX
- [ ] Tạo câu hỏi từ hình ảnh (OCR)
- [ ] Tạo câu hỏi từ video bài giảng
- [ ] Ngân hàng câu hỏi AI
- [ ] Phân tích độ khó tự động
- [ ] Xuất đề thi ra Word/PDF

## 🆘 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra lại các bước trong hướng dẫn
2. Xem phần "Xử lý lỗi thường gặp"
3. Liên hệ quản trị viên hệ thống

## 📚 Tài Liệu Tham Khảo

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Pricing](https://ai.google.dev/pricing) - Miễn phí!

---

**Phát triển bởi:** Nhóm NCKH Tuyên Quang
**Cập nhật lần cuối:** 2026-02-12
