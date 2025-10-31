const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// Подключаем маршруты
const postRoutes = require('./service');
app.use('/', postRoutes);

// Подключаем MongoDB
async function mongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(' MongoDB подключен');
  } catch (err) {
    console.error(' Ошибка подключения к MongoDB:', err.message);
  }
}
mongo();

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Сервер запущен на порту ${PORT}`));
