const fs = require('fs');
const path = require('path');
const packageJson = require('./package.json');

const version = packageJson.version;
const content = `export const APP_VERSION = "${version}";\n`;

const outputPath = path.join(__dirname, 'src', 'version.js');

fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Đã tạo tệp ${path.basename(outputPath)} tại ${path.dirname(outputPath)} với phiên bản ${version}`);