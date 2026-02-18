require("dotenv").config();
const mongoose = require("mongoose");
const Holiday = require("../models/Holiday");

const insertHolidays = async () => {
  try {
   await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to DB");

    await Holiday.deleteMany({ year: 2026 });

    await Holiday.insertMany([
      { name: "New Year's Day", date: new Date(2026, 0, 1), category: "Special", year: 2026 },
      { name: "Republic Day", date: new Date(2026, 0, 26), category: "National", year: 2026 },
       { name: "Valentine's Day", date: new Date(2026, 1, 14), category: "Special", year: 2026 },
      { name: "Maha Shivratri", date: new Date(2026, 1, 15), category: "Special", year: 2026 },
      { name: "Holi", date: new Date(2026, 2, 4), category: "Festival", year: 2026 },
      { name: "Baisakhi", date: new Date(2026, 3, 13), category: "Festival", year: 2026 },
      { name: "Raksha Bandhan", date: new Date(2026, 7, 28), category: "Special", year: 2026 },
      { name: "Birthday Guru Nanak Dev Ji", date: new Date(2026, 10, 24), category: "Festival", year: 2026 },
      { name: "Karwa Chauth", date: new Date(2026, 9, 29), category: "Special", year: 2026 },
      { name: "Choti Diwali", date: new Date(2026, 10, 7), category: "Festival", year: 2026 },
      { name: "Vishwakarna Day", date: new Date(2026, 10, 9), category: "Special", year: 2026 },
      { name: "Independence Day", date: new Date(2026, 7, 15), category: "National", year: 2026 },
      { name: "Janmashtami", date: new Date(2026, 8, 4), category: "Festival", year: 2026 },
      { name: "Gandhi Jayanti", date: new Date(2026, 9, 2), category: "National", year: 2026 },
      { name: "Dussehra", date: new Date(2026, 9, 20), category: "Festival", year: 2026 },
      { name: "Badi Diwali", date: new Date(2026, 10, 8), category: "Festival", year: 2026 },
      { name: "Bhai Dooj", date: new Date(2026, 10, 10), category: "Special", year: 2026 },
      { name: "Christmas Day", date: new Date(2026, 11, 25), category: "Festival", year: 2026 }
    ]);


    console.log("Inserted successfully ✅");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

insertHolidays();


 