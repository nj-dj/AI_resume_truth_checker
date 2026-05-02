import { createApp } from "./src/app.js";
import { connectDatabase } from "./src/database/mongodb.js";

connectDatabase();

export default createApp();
