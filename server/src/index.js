import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Start accepting requests right away; DB connects in the background so a
// slow/unavailable MongoDB doesn't block the whole API from booting.
app.listen(PORT, () => {
  console.log(`Sugam Group API listening on port ${PORT}`);
});

connectDB();
