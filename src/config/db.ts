import mongoose from "mongoose";


const connectDatabase = async() => {
    try {
        const db = await mongoose.connect(process.env.DATABASE_URL as string, {
            dbName:"AcreMate"
        });
        console.log("Database...");
    } catch (error) {
        console.log(error);
    }
};


export default connectDatabase;