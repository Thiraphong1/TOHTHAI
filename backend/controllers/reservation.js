// controllers/reservation.js
const prisma = require('../config/prisma');

// ... (getAvailableTables อาจจะต้องปรับ หรือสร้างใหม่) ...

exports.createReservation = async (req, res) => {
  try {
    // 1. รับข้อมูล (เพิ่ม validation)
    const { tableId, reservationTimeString, numberOfGuests } = req.body; // รับเป็น string เวลา เช่น "14:30"
    const userId = Number(req.user.id);

    if (!tableId || !reservationTimeString || !numberOfGuests) {
        return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    // 2. แปลงเวลาและตรวจสอบช่วงเวลาที่อนุญาต
    const [hours, minutes] = reservationTimeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < 10 || hours >= 18) { // ตรวจสอบเวลา 10:00 - 17:59
      return res.status(400).json({ message: "สามารถจองได้ระหว่างเวลา 10:00 - 17:59 เท่านั้น" });
    }

    // 3. ตรวจสอบว่ายังไม่เลยเวลาปิดรับจองของวัน
    const now = new Date();
    const closingTime = new Date();
    closingTime.setHours(18, 0, 0, 0); // ตั้งเวลาปิดเป็น 18:00:00.000 ของวันนี้
    if (now >= closingTime) {
      return res.status(400).json({ message: "ขออภัย ปิดรับการจองสำหรับวันนี้แล้ว (หลัง 18:00 น.)" });
    }

    // 4. สร้าง DateTime object สำหรับวันนี้ + เวลาที่ขอ
    const requestedTime = new Date();
    requestedTime.setHours(hours, minutes, 0, 0); // ตั้งเวลาตามที่ User ขอ *สำหรับวันนี้*

    // 5. [สำคัญ] คำนวณเวลาสิ้นสุด (ยังคงแนะนำให้มี เพื่อเช็คซ้ำซ้อนได้แม่นยำ)
    const reservationDurationMs = 2 * 60 * 60 * 1000; // สมมติจองทีละ 2 ชั่วโมง
    const reservationEndTime = new Date(requestedTime.getTime() + reservationDurationMs);


    const reservation = await prisma.$transaction(async (tx) => {
      // 6. ค้นหาโต๊ะ (เช็คความจุ)
      const table = await tx.table.findUnique({ where: { id: Number(tableId) } });
      if (!table) throw new Error("ไม่พบโต๊ะที่ต้องการจอง");
      if (numberOfGuests > table.capacity) throw new Error(`โต๊ะนี้รองรับได้สูงสุด ${table.capacity} คน`);

      // 7. ✅ ตรวจสอบการจองซ้ำซ้อน *เฉพาะวันนี้* และ *ช่วงเวลาคาบเกี่ยว*
      const conflictingReservation = await tx.reservation.findFirst({
        where: {
          tableId: Number(tableId),
          status: { in: ['PENDING', 'CONFIRMED'] },
          // เช็คว่าช่วงเวลาที่ขอ คาบเกี่ยวกับช่วงเวลาของการจองอื่น *ในวันเดียวกัน* หรือไม่
          reservationTime: { lt: reservationEndTime }, // เวลาเริ่มจองเก่า < เวลาสิ้นสุดที่ขอ
          reservationEndTime: { gt: requestedTime } // เวลาสิ้นสุดจองเก่า > เวลาเริ่มต้นที่ขอ
        },
      });

      if (conflictingReservation) {
        throw new Error("ขออภัย โต๊ะนี้ถูกจองแล้วในช่วงเวลาดังกล่าวสำหรับวันนี้");
      }

      // 8. สร้างการจอง (สถานะ PENDING หรือ CONFIRMED ก็ได้ แล้วแต่ระบบ)
      const newReservation = await tx.reservation.create({
        data: {
          tableId: Number(tableId),
          reservationTime: requestedTime, // เวลาเต็ม (วันนี้ + เวลาที่ขอ)
          reservationEndTime: reservationEndTime, // เวลาสิ้นสุด
          numberOfGuests: Number(numberOfGuests),
          reservedById: userId,
          status: 'CONFIRMED', // หรือ PENDING ถ้า Admin ต้องยืนยัน
        }
      });

      // 9. ❌ ไม่ต้องอัปเดต Table.status แล้ว

      return newReservation;
    });

    res.status(201).json({ message: "จองโต๊ะสำเร็จ!", reservation });

  } catch (err) {
    console.error("Error creating reservation:", err);
    if (err.message.includes("ไม่พบโต๊ะ") || err.message.includes("รองรับได้สูงสุด") || err.message.includes("ถูกจองแล้ว") || err.message.includes("สามารถจองได้") || err.message.includes("ปิดรับการจอง")) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

// --- ฟังก์ชันดึงโต๊ะที่ว่าง (ปรับปรุง) ---
/**
 * @desc    (Public) ดึงข้อมูลโต๊ะทั้งหมด พร้อมบอกว่า *ตอนนี้* ว่างหรือไม่
 * ใช้สำหรับแสดงสถานะปัจจุบัน หรือให้พนักงานดูภาพรวม
 */
exports.getTablesCurrentStatus = async (req, res) => {
    try {
        const now = new Date();
        const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000); // สมมติจอง 2 ชม.

        // 1. ดึงโต๊ะทั้งหมด
        const allTables = await prisma.table.findMany({ orderBy: { number: 'asc' } });

        // 2. ดึงการจอง *วันนี้* ที่ยัง Active และคาบเกี่ยวกับ *เวลาปัจจุบัน*
        const currentReservations = await prisma.reservation.findMany({
            where: {
                status: 'CONFIRMED', // เฉพาะที่ยืนยันแล้ว
                reservationTime: { lt: twoHoursLater }, // การจองที่เริ่มก่อนที่ช่วงเวลาปัจจุบันจะหมดไป
                reservationEndTime: { gt: now }       // การจองที่ยังไม่สิ้นสุด ณ เวลาปัจจุบัน
            },
            select: { tableId: true }
        });
        const currentlyOccupiedTableIds = new Set(currentReservations.map(r => r.tableId));

        // 3. Map สถานะปัจจุบัน
        const tablesWithCurrentStatus = allTables.map(table => ({
            ...table,
            // โต๊ะว่าง "ตอนนี้" ถ้า status เดิมเป็น AVAILABLE และไม่มีการจองที่ Active อยู่
            isAvailableNow: table.status === 'AVAILABLE' && !currentlyOccupiedTableIds.has(table.id)
        }));

        res.json(tablesWithCurrentStatus);

    } catch (err) {
        console.error("Error in getTablesCurrentStatus:", err);
        res.status(500).json({ message: "Server Error" });
    }
};