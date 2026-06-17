require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
console.log("URI loaded:", process.env.MONGO_URI);

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});