import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const DB_USERNAME = process.env.DB_USERNAME || "";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const MONGO_URI = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@gearfight.qux5zo9.mongodb.net/?retryWrites=true&w=majority&appName=GearFight`;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!MONGO_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to preserve the client across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGO_URI, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, always create a new client
  client = new MongoClient(MONGO_URI, options);
  clientPromise = client.connect();
}

export default clientPromise;