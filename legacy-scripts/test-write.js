const { writeFile, mkdir } = require("fs/promises");
const { join } = require("path");

async function testWrite() {
    try {
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        console.log("Target directory:", uploadDir);

        await mkdir(uploadDir, { recursive: true });
        console.log("Directory created/verified");

        const filepath = join(uploadDir, 'test-write.txt');
        await writeFile(filepath, "Hello World");
        console.log("File written successfully to:", filepath);
    } catch (error) {
        console.error("Error writing file:", error);
    }
}

testWrite();
