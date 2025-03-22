const fs = require('fs');
const path = require('path');

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// Baca file konfigurasi
const FILE_PATH = path.join(__dirname, '../../application-properties.arc'); // Sesuaikan dengan lokasi file konfigurasi
const OUTPUT_DIR = path.join(__dirname, '../.env.login-server'); // Folder tujuan output (misal ke folder utama)

const sectionRegex = /\[(.*?)\]\s*([\s\S]*?)(?=\n\[|$)/g;

// 🔹 Fungsi untuk menyalin isi header tertentu ke satu file
const copyHeadersToFile = (filePath, headersToCopy, outputFile) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    let collectedContent = ''; // Menyimpan semua isi dari header yang ditemukan
    
    let match;
    while ((match = sectionRegex.exec(fileContent)) !== null) {
        const sectionName = match[1].trim(); // Nama header
        const sectionContent = match[2].trim(); // Isi header
        
        if (headersToCopy.includes(sectionName)) {
            collectedContent += `[${sectionName}]\n${sectionContent}\n\n`; // Tambahkan ke hasil
        }
    }

    if (collectedContent) {
        fs.writeFileSync(outputFile, collectedContent, 'utf8');
        console.log(`✅ Berhasil menyalin isi header ke: ${outputFile}`);
    } else {
        console.log(`⚠️ Tidak ada header yang cocok ditemukan.`);
    }
};

// 📌 Contoh Penggunaan
const headersToCopy = ['APP-GLOBAL', 'LOGIN-SERVER']; // Header yang ingin disalin

copyHeadersToFile(FILE_PATH, headersToCopy, OUTPUT_DIR);










// const fs = require('fs');
// const path = require('path');

// // Baca file konfigurasi
// const FILE_PATH = path.join(__dirname, '../../application-properties.arc'); // Sesuaikan dengan lokasi file konfigurasi
// const OUTPUT_DIR = path.join(__dirname, '../'); // Folder tujuan output (misal ke folder utama)

// const fileContent = fs.readFileSync(FILE_PATH, 'utf8');

// // Regex untuk menangkap header dan properti
// const sectionRegex = /\[(.*?)\]\s*([\s\S]*?)(?=\n\[|$)/g;
// const keyValueRegex = /^(\w+)=([\s\S]+)$/gm;

// let match;
// while ((match = sectionRegex.exec(fileContent)) !== null) {
//     const sectionName = match[1].replace(/\s+/g, '_'); // Header (misal: APP-GLOBAL)
//     const allowedHeaders = ['APP-GLOBAL','MAIN-SERVER']; // Hanya header ini yang akan diproses
//     if (!allowedHeaders.includes(sectionName)) continue;

//     const properties = match[2]; // Isi dari header

//     let envContent = '';
//     let propMatch;
//     while ((propMatch = keyValueRegex.exec(properties)) !== null) {
//         const key = propMatch[1];
//         const value = propMatch[2].trim();
//         envContent += `${key}=${value}\n`;
//     }

//     if (envContent) {
//         const envFileName = `.env.${sectionName.toLowerCase()}`;
//         const outputPath = path.join(OUTPUT_DIR, envFileName);

//         fs.writeFileSync(outputPath, envContent, 'utf8');
//         console.log(`File ${outputPath} berhasil dibuat.`);
//     }
// }






// const fs = require('fs');
// const path = require('path');

// // Baca file konfigurasi
// const FILE_PATH = '../application-properties.arc'; // Ganti dengan nama file yang benar
// const fileContent = fs.readFileSync(FILE_PATH, 'utf8');

// // Regex untuk menangkap header dan properti
// const sectionRegex = /\[(.*?)\]\s*([\s\S]*?)(?=\n\[|$)/g;
// const keyValueRegex = /^(\w+)=([\s\S]+)$/gm;

// let match;
// while ((match = sectionRegex.exec(fileContent)) !== null) {
//     const sectionName = match[1].replace(/\s+/g, '_'); // Header (misal: APP-GLOBAL)
//     const allowedHeaders = ['APP-GLOBAL','MAIN-SERVER']; // Hanya header ini yang akan diproses
//     if (!allowedHeaders.includes(sectionName)) continue;

//     const properties = match[2]; // Isi dari header

//     let envContent = '';
//     let propMatch;
//     while ((propMatch = keyValueRegex.exec(properties)) !== null) {
//         const key = propMatch[1];
//         const value = propMatch[2].trim();
//         envContent += `${key}=${value}\n`;
//     }

//     if (envContent) {
//         const envFileName = `.env.${sectionName.toLowerCase()}`;
//         fs.writeFileSync(envFileName, envContent, 'utf8');
//         console.log(`File ${envFileName} berhasil dibuat.`);
//     }
// }
