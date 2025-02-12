import app from "./app";
import connectDatabase from "./config/db";
import errorMiddleware from "./middlewares/errorMiddleware";

const PORT = 8000;

connectDatabase();


app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log("Listening...");
});