# 💚 NongOm: Smart Spending (V2)

> **แอพพลิเคชันบันทึกรายรับ-รายจ่ายและจัดการการเงินส่วนบุคคลอัจฉริยะ**  
> สแกนสลิปโอนเงินอัตโนมัติด้วย AI • วางแผนสัดส่วน 50/30/20 • จัดการหลายกระเป๋าเงิน • ปลอดภัย 100% Offline-First

---

## 🌟 ฟีเจอร์หลัก (Key Features)

1. 🤖 **AI Bank Slip Scanner (สแกนสลิปธนาคารอัตโนมัติ)**
   - สแกนสลิปโอนเงินของทุกธนาคารในประเทศไทย (KBank, SCB, PromptPay, กรุงไทย, TrueMoney ฯลฯ)
   - ตรวจจับยอดเงิน วันที่ และผู้รับเงิน พร้อมเลือกหมวดหมู่ให้อัตโนมัติใน 1 วินาที

2. 🎯 **วางแผนการเงินตามกฎ 50/30/20 & Pay Yourself First**
   - จัดสรรเงินรายได้เป็น **จำเป็น 50% (Needs)**, **ตามใจ 30% (Wants)**, และ **เงินออม 20% (Savings)**
   - แถบวัดผลสุขภาพทางการเงินแบบเรียลไทม์

3. 💳 **ระบบรวมศูนย์หลายกระเป๋าเงิน (Multi-Wallet Master)**
   - จัดการเงินสด, บัญชีธนาคาร, e-Wallet, และบัตรเครดิตได้ครบในที่เดียว
   - โอนเงินข้ามกระเป๋า และคำนวณสินทรัพย์สุทธิ (Net Worth) อัตโนมัติ

4. 📊 **วิเคราะห์กระแสเงินสด & สถิติเชิงลึก (Visual Analytics)**
   - **Donut Chart** สัดส่วนรายจ่ายแยกตามหมวดหมู่
   - **Cash Flow Trend Bar Chart** แนวโน้มรายรับ-รายจ่ายรายวันและรายเดือน

5. 🎯 **คุมงบประมาณ & กระปุกเงินออมตามเป้าหมาย (Budgets & Goals)**
   - กำหนดเพดานการใช้จ่ายแต่ละหมวดหมู่พร้อมแถบเตือนสถานะ
   - กระปุกออมเงินตามความฝัน (เช่น กองทุนฉุกเฉิน, ท่องเที่ยว) พร้อมเอฟเฟกต์พลุฉลองความสำเร็จ

6. 🔒 **ระบบล็อกอิน & ความปลอดภัยส่วนตัว (100% Offline-First)**
   - ระบบ **เข้าสู่ระบบ (Sign In)** และ **สมัครสมาชิก (Register)** พร้อมปุ่ม **1-Click Demo Login**
   - ข้อมูลบันทึกบนอุปกรณ์ของคุณ ปลอดภัย ไม่ส่งข้อมูลขึ้นเซิร์ฟเวอร์ภายนอก

7. 📥 **ส่งออกรายงาน & สำรองข้อมูล (Export & Backup)**
   - ดาวน์โหลดรายงานสรุปการเงินเป็นไฟล์ **Excel (.xlsx)**, **CSV**, หรือ **PDF Report**
   - สำรองข้อมูลและกู้คืนด้วยไฟล์ **JSON Backup**

---

## 🚀 วิธีเปิดใช้งาน (Getting Started)

### วิธีที่ 1: เปิดผ่านเบราว์เซอร์โดยตรง
- ดับเบิ้ลคลิกไฟล์ `index.html` หรือเปิดผ่าน Google Chrome / Microsoft Edge

### วิธีที่ 2: รันผ่าน Local Server (แนะนำ)
- ดับเบิ้ลคลิกไฟล์ `run_app.bat`
- หรือเปิด PowerShell แล้วรันคำสั่ง:
  ```powershell
  powershell -ExecutionPolicy Bypass -File tcp_server.ps1
  ```
- เปิดเบราว์เซอร์ไปที่ **http://127.0.0.1:8000**

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Core**: HTML5, Vanilla CSS3 (Custom Design System & Figma Green Palette), Vanilla JavaScript (ES6 Modules)
- **Icons**: Lucide Icons
- **Charts**: Chart.js
- **OCR Engine**: Tesseract.js (Bank Slip Recognition)
- **Exporting**: SheetJS (XLSX), jsPDF, AutoTable
- **Effects**: Canvas Confetti

---

## 📄 License
MIT License • Created for **NongOm: Smart Spending**
