import { app } from "./app.js";
import seedSuperAdmin from "./app/seedSuperAdmin/seedSuperAdmin.js";
const main = () => {
    const server = app.listen(4000, () => {
        seedSuperAdmin();
        console.log(`server is connected on ${4000}`);
    });
    const exit = () => {
        if (server) {
            server.close(() => {
                console.info("server closed");
            });
            process.exit(1);
        }
    };
    process.on('uncaughtException', () => {
        exit();
    });
    process.on('unhandledRejection', () => {
        exit();
    });
};
main();
