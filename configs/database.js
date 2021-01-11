import mongoose from "mongoose";

// database connection

const DB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });

  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
};

export default DB;
