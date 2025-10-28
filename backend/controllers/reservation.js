// controllers/reservation.js
const prisma = require('../config/prisma');

const RESERVATION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 ชั่วโมง
const OPEN_HOUR = 8; // 08:00 น.
const CLOSE_HOUR = 17; // 17:00 น.
const MAX_LEAD_TIME_MS = 2 * 60 * 60 * 1000; // 2 ชั่วโมง

exports.createReservation = async (req, res) => {
  try {
    const { tableId, reservationTimeString, numberOfGuests } = req.body;
    const userId = Number(req.user.id);

    // 1. ตรวจสอบข้อมูลที่จำเป็น
    if (!tableId || !reservationTimeString || !numberOfGuests) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }
    
    // 2. แปลงเวลาและตรวจสอบช่วงเวลาเปิดทำการ
    const [hours, minutes] = reservationTimeString.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes) || hours < OPEN_HOUR || hours >= CLOSE_HOUR) {
      return res.status(400).json({ message: `สามารถจองได้ระหว่างเวลา ${OPEN_HOUR}:00 - ${CLOSE_HOUR - 1}:59 น. เท่านั้น` });
    }

    // 3. กำหนดเวลาที่ขอจองและเวลาปัจจุบัน
    const now = new Date();
    
    // 3.1 สร้าง DateTime object สำหรับวันนี้ + เวลาที่ขอ
    const requestedTime = new Date();
    requestedTime.setHours(hours, minutes, 0, 0);

    // 3.2 คำนวณเวลาที่ช้าที่สุดที่จองได้ (ปัจจุบัน + 2 ชั่วโมง)
    const latestBookableTime = new Date(now.getTime() + MAX_LEAD_TIME_MS); 
    
    // 3.3 คำนวณเวลาสิ้นสุดการจอง
    const reservationEndTime = new Date(requestedTime.getTime() + RESERVATION_DURATION_MS);

    // 4. ✅ [LOGIC ตรวจสอบเวลาใหม่]
    
    // 4.1 ต้องไม่เป็นเวลาในอดีต (ห้ามจองย้อนหลัง)
    if (requestedTime < now) {
         return res.status(400).json({ message: "ไม่สามารถจองในเวลาที่ผ่านมาแล้วได้" });
    }
    
    // 4.2 ตรวจสอบเงื่อนไข "ไม่เกิน 2 ชั่วโมง" (Maximum Lead Time)
    if (requestedTime > latestBookableTime) {
      const latestBookableHours = latestBookableTime.toLocaleTimeString('th-TH', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
      return res.status(400).json({ 
          message: `การจองต้องทำภายใน 2 ชั่วโมงนับจากเวลาปัจจุบันเท่านั้น เวลาที่ช้าที่สุดที่สามารถจองได้คือ ${latestBookableHours} น.`,
      });
    }
    
    // 4.3 ตรวจสอบว่าเลยเวลาปิดรับจองของวันไปแล้วหรือไม่
    const closingTimeToday = new Date();
    closingTimeToday.setHours(CLOSE_HOUR, 0, 0, 0); 
    if (requestedTime >= closingTimeToday) {
         return res.status(400).json({ message: `ไม่สามารถจองได้หลัง ${CLOSE_HOUR}:00 น.`,});
    }

    // 5. ใช้ Transaction
    const reservation = await prisma.$transaction(async (tx) => {
      // 5.1 ค้นหาโต๊ะ (เช็คความจุ)
      const table = await tx.table.findUnique({
        where: { id: Number(tableId) },
      });

      if (!table) {
        throw new Error("ไม่พบโต๊ะที่ต้องการจอง");
      }
      if (numberOfGuests > table.capacity) {
        throw new Error(`โต๊ะนี้รองรับได้สูงสุด ${table.capacity} คน`);
      }
      
      // 5.2 ตรวจสอบการจองซ้ำซ้อน *เฉพาะวันนี้* และ *ช่วงเวลาคาบเกี่ยว*
      const conflictingReservation = await tx.reservation.findFirst({
        where: {
          tableId: Number(tableId),
          status: { in: ['PENDING', 'CONFIRMED'] }, // เช็คเฉพาะการจองที่ยัง Active
          
          // Logic การเช็คเวลาคาบเกี่ยว:
          reservationTime: {
            lt: reservationEndTime,
          },
          reservationEndTime: {
            gt: requestedTime,
          }
        },
      });

      if (conflictingReservation) {
        throw new Error("ขออภัย โต๊ะนี้ถูกจองแล้วในช่วงเวลาดังกล่าว กรุณาเลือกเวลาอื่น");
      }

      // 5.3 สร้างการจอง
      const newReservation = await tx.reservation.create({
        data: {
          tableId: Number(tableId),
          reservationTime: requestedTime,
          reservationEndTime: reservationEndTime, // บันทึกเวลาสิ้นสุด
          numberOfGuests: Number(numberOfGuests),
          reservedById: userId,
          status: 'PENDING', // ให้ Admin ยืนยัน
        }
      });

      return newReservation;
    });

    res.status(201).json({ message: "ส่งคำขอจองโต๊ะสำเร็จ รอการยืนยัน", reservation });

  } catch (err) {
    console.error("Error creating reservation:", err);
    // ส่ง message ที่เราสร้างเองกลับไปให้ Frontend
    if (err.message.includes("ไม่พบโต๊ะ") || err.message.includes("รองรับได้สูงสุด") || err.message.includes("ถูกจองแล้ว") || err.message.includes("สามารถจองได้") || err.message.includes("ปิดรับการจอง") || err.message.includes("ล่วงหน้าอย่างน้อย") || err.message.includes("เวลาที่ผ่านมาแล้ว")) {
      return res.status(400).json({ message: err.message });
    }
    // จัดการ Error P2002 (Unique constraint violation) กรณีจองเวลาซ้ำเป๊ะ
    if (err.code === 'P2002') {
        return res.status(409).json({ message: "คุณได้จองโต๊ะนี้ในเวลานี้ไปแล้ว" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};
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
exports.getAvailableTables = async (req, res) => {
  try {
    const tables = await prisma.table.findMany({
      where: { status: 'AVAILABLE' }, // กรองเฉพาะโต๊ะที่เปิดให้บริการ (ไม่ปิดซ่อม)
      orderBy: { number: 'asc' },
    });
    res.json(tables);
  } catch (err) { 
    console.error("Error in getAvailableTables:", err);
    res.status(500).json({ message: "Server Error" }); 
  }
};