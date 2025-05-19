import mongoose from "mongoose";

let MONGODB_URI: string = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Append default database name if not already specified
if (!MONGODB_URI.includes("/")) {
  MONGODB_URI += "/whereisjulien";
}

/**
 * Cached connection for MongoDB.
 */
interface Cached {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
}

let cached: Cached = (global as unknown as { mongoose: Cached }).mongoose || {
  conn: null,
  promise: null,
};

if (!cached) {
  cached = (global as unknown as { mongoose: Cached }).mongoose = {
    conn: null,
    promise: null,
  };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((connection) => {
      return connection.connection;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
