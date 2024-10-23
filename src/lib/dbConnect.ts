import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
};

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
  // Check if we have a connection to the database or if it's currently connecting
  if (connection.isConnected) {
    console.log("Already connected to the database");
    return;
  }

  try {
    // Attempt to connect to the database
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});

    console.log(db, "db object");

    connection.isConnected = db.connections[0].readyState;

    console.log(connection, "connection object");

    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);

    // process.exit(0) means the process exited successfully (no errors).
    // process.exit(1) (or any non-zero value) indicates that the process terminated due to an error.
    process.exit(1);
  }
}

export default dbConnect;

// let isConnected = false;

// export async function dbConnect() {
//   if (isConnected) {
//     return;
//   }

//   try {
//     const db = await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });

//     isConnected = db.connections[0].readyState;
//     console.log('Connected to the database');
//   } catch (error) {
//     console.error('Error connecting to the database:', error);
//     throw error;
//   }
// }
