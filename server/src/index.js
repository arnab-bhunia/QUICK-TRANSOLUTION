import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { startBlogScheduler } from "./utils/blogScheduler.js";
import { startRecruitmentScheduler } from "./utils/recruitmentScheduler.js";

const PORT = process.env.PORT || 5000;


// Start accepting requests right away; DB connects in the background so a
// slow/unavailable MongoDB doesn't block the whole API from booting.
app.listen(PORT, () => {
  console.log(`quick-transolution API listening on port ${PORT}`);
});

connectDB();
startBlogScheduler();
// Careers-only scheduler — independent of, and untouched-by, the Blog
// scheduler above. See utils/recruitmentScheduler.js for why these are
// deliberately kept as two separate schedulers.
startRecruitmentScheduler();
