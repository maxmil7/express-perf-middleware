const fs = require('fs');

module.exports = function ({ routeKey='perf', interval=30000 }={}) {
    let stream;
    let intervalId;
    let fileName;
    return function (req, res, next) {
        if (req.path.indexOf(`${routeKey}/start`) != -1) {
            if (stream) {
                res.send(`Capture metrics in progress. Call /${routeKey}/end first`);
                return;
            }
            fileName = `${Date.now()}.txt`;
            stream = fs.createWriteStream(fileName);
            let startCPU = process.cpuUsage();
            let currentCPU;
            let startTime = Date.now();
            intervalId = setInterval(() => {
                cpuDiff = process.cpuUsage(startCPU);
                startCPU = process.cpuUsage();
                const memUsage = process.memoryUsage();
                let metrics = {
                    time: Math.floor((Date.now() - startTime)/1000),
                    cpu: cpuDiff.user + cpuDiff.system,
                    rss: Math.floor(memUsage.rss*1e-6),
                    heapT: Math.floor(memUsage.heapTotal*1e-6),
                    heapU: Math.floor(memUsage.heapUsed*1e-6),

                }
                stream.write(`${metrics.time} ${metrics.cpu} ${metrics.rss} ${metrics.heapT} ${metrics.heapU} \n`);
            }, interval)
            res.send('Capture metrics started');
        } else if (req.path.indexOf(`${routeKey}/end`) != -1) {
            if (!(intervalId && stream)) {
                res.send(`Capture metrics not started. Call /${routeKey}/start first`);
                return;
            }
            clearInterval(intervalId);
            stream.end();
            intervalId = null;
            stream = null;
            res.sendfile(`./${fileName}`);
        } else {
            next();
        }

    }
}