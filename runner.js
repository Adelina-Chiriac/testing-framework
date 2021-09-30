const fs = require("fs");
const path = require("path");

class Runner {
    constructor() {
        this.testFiles = [];
    }

    async collectFiles(targetPath) {
        const files = await fs.promises.readdir(targetPath);

        for (let file of files) {
            const filepath = path.join(targetPath, file);
            const stats = await fs.promises.lstat(filepath);

            if (stats.isFile() && file.includes(".test.js")) {
                this.testFiles.push({ name: filepath });
            }
            else if (stats.isDirectory()) {
                const childFiles = await fs.promises.readdir(filepath);

                files.push(...childFiles.map(f => path.join(file, f)));
            }
        }
    }

    async runTests() {
        for (let file of this.testFiles) {

            const beforeEaches = [];
            global.beforeEach = (func) => {
                beforeEaches.push(func);
            };
            global.it = (description, func) => {
                beforeEaches.forEach(fn => fn()); 
                try {
                    func();
                    console.log(`OK - ${description}`);
                }
                catch(err) {
                    console.log(`X - ${description}`);
                    console.log("\t", err.message);
                }
            };
            try {
                require(file.name);
            }
            catch(err) {
                console.log("X - Error Loading File", file.name);
                console.log(err);
            }
        }
    }
}

module.exports = Runner;