import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

// ໂຫຼດຄ່າຈາກໄຟລ໌ .env
dotenv.config();

const app = express();
// ຖ້າໃນ .env ບໍ່ມີ PORT ໃຫ້ໃຊ້ເລກ 5000 ແທນ
const PORT = process.env.PORT || 5000;

// ເປີດໃຫ້ Express ອ່ານຂໍ້ມູນແບບ JSON ໄດ້ (ຈຳເປັນຫຼາຍໃນການເຮັດ API)
app.use(express.json());

// ເສັ້ນທາງ API (Route) ທຳອິດສຳລັບທົດສອບ
app.get('/', (req: Request, res: Response) => {
  res.json({ message: "Welcome to Team Task Manager API! 🚀" });
});

// ສັ່ງໃຫ້ Server Run ຕາມ Port ທີ່ກຳນົດ
app.listen(PORT, () => {
  console.log(`⚡ [server]: Server is running at http://localhost:${PORT}`);
});