import { MongoClient, Db } from "mongodb";

if (!process.env.NEXT_PUBLIC_MONGO_URL) {
  throw new Error("Please add NEXT_PUBLIC_MONGO_URL to .env.local");
}

const uri = process.env.NEXT_PUBLIC_MONGO_URL;
const options = {
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  tls: true,
};

let client: MongoClient;
const clientPromise: Promise<MongoClient> = (() => {
  if (process.env.NODE_ENV === "development") {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    const globalWithMongo = globalThis as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    return globalWithMongo._mongoClientPromise;
  } else {
    // In production mode, it's best to not use a global variable.
    client = new MongoClient(uri, options);
    return client.connect();
  }
})();

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise;

export async function getDatabase(): Promise<Db> {
  const client = await clientPromise;
  // Extract database name from connection string or use default
  const dbName = uri.split("/").pop()?.split("?")[0] || "ai_sales_force";
  return client.db(dbName);
}
