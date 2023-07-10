const cluster = require("cluster");
const os = require("os");

if (cluster.isMaster) {
    const cpusCount = os.cpus().length;

    console.log(`CPUs: ${cpusCount}`);

    console.log("Master start");

    for (let i = 0; i < cpusCount - 1; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker) => {
        console.log(`worker died, pid: ${worker.process.pid}`);
        cluster.fork();
    });
}

if (cluster.isWorker) {
    require("../server/server/server.js");
}
