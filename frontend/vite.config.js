import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // ✅ [เพิ่ม] การตั้งค่า Server เพื่ออนุญาตการเชื่อมต่อจากภายนอก
  server: {
    host: true, // หรือ host: '0.0.0.0'
    // port: 5173, // (ถ้าต้องการกำหนดพอร์ตชัดเจน)
  }
});