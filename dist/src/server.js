import { app } from "./app.js";
const main = () => {
    app.listen(3000, () => {
        console.log(`server is connected on ${3000}`);
    });
};
main();
