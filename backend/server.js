import dns from "dns";
dns.setServers(["1.1.1.1", "8.8.8.8"]);
import "dotenv/config";

import connectDB from "./config/db.js";
import app from "./app.js";

connectDB();

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
