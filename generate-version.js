// generate-version.js
const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json'); // Đọc tệp package.json

const version = packageJson.version;
// Tạo nội dung cho tệp version.js, ví dụ: export const APP_VERSION = "1.0.0";
const content = `export const APP_VERSION = "${version}";
console.log("APP_VERSION: " + APP_VERSION);`;

// Đường dẫn đến nơi lưu tệp version.js (ví dụ: bên trong thư mục js/)
// Đảm bảo đường dẫn này đúng với cấu trúc thư mục của bạn
const outputPath = path.join(__dirname, 'js', 'version.js');

fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Đã tạo tệp ${path.basename(outputPath)} tại ${path.dirname(outputPath)} với phiên bản ${version}`);