import { NextResponse } from "next/server";
import clientPromise from "@/scripts/mongoDB";

/**
 * This API route handles POST requests to fetch data from a MongoDB collection.
 * It expects a JSON body with the following structure:
 * {
 *   "dbName": "yourDatabaseName",
 *   "collectionName": "yourCollectionName",
 *   "query": { ... } // Optional query object
 * }
 *
 * @param {Request} request - The incoming request object.
 * @returns {Promise<NextResponse>} - A promise that resolves to a NextResponse object.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { dbName, collectionName, query } = await request.json();

    if (!collectionName) {
      return NextResponse.json({ error: "Collection name is required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const data = await collection.find(query || {}).toArray();
    return NextResponse.json(data);
  } catch (error) {
    console.error("MongoDB Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}