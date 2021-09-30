const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const render = require("./render");

const forbiddenDirectories = ["node_modules"];

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
                this.testFiles.push({ name: filepath, shortName: file });
            }
            else if (stats.isDirectory() && !forbiddenDirectories.includes(file)) {
                const childFiles = await fs.promises.readdir(filepath);

                files.push(...childFiles.map(f => path.join(file, f)));
            }
        }
    }

    async runTests() {
        for (let file of this.testFiles) {
            console.log(chalk.gray(`---- ${file.shortName}`));

            const beforeEaches = [];

            global.render = render;
            global.beforeEach = (func) => {
                beforeEaches.push(func);
            };
            global.it = async (description, func) => {
                beforeEaches.forEach(fn => fn()); 
                try {
                    await func();
                    console.log(chalk.green(`\tOK - ${description}`));
                }
                catch(err) {
                    const message = err.message.replace(/\n/g, "\n\t\t");
                    console.log(chalk.red(`\tX - ${description}`));
                    console.log(chalk.red("\t", message));
                }
            };
            try {
                require(file.name);
            }
            catch(err) {
                console.log(chalk.red("X - Error Loading File", file.name));
                console.log(chalk.red(err));
            }
        }
    }
}

module.exports = Runner;