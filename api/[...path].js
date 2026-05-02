import { createApp } from "../backend/src/app.js";
import { connectDatabase } from "../backend/src/database/mongodb.js";

const app = createApp();
let databaseConnectionPromise;

const ensureDatabaseConnection = () => {
  if (!databaseConnectionPromise) {
    databaseConnectionPromise = connectDatabase();
  }

  return databaseConnectionPromise;
};

export default async function handler(request, response) {
  await ensureDatabaseConnection();
  return app(request, response);
}
