import app from "./app";
import errorMiddleware from "./middlewares/errorMiddleware";

const PORT = 8000;



app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log("Listening...");
});