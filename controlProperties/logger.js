const fs = require('fs');
const path = require('path');

const createLogger = () => {
    let outputDir = path.join(__dirname, 'logs'); // Folder log default
    let logStream = null;
    let logFilePath = null;
    let customLogFileName = "defaultLog";
    let silentMode = false;
    let lineLogCode = null

    // **Fungsi mendapatkan timestamp**
    const getTimeStamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

    //GET exact line of log
    const getLineCode = () => {
        const err = new Error();
        const stackLine = err.stack.split("\n")[2]; // Baris ke-2 mengandung informasi lokasi
        const match = stackLine.match(/:(\d+):\d+\)?$/); // Ambil nomor baris
        
        const regex = /([^\\\/]+\.js)/;
        const STL = err.stack.split("\n")[2]
        const matchFName = STL.match(regex);
        
        const lineResult =  ":" + (match ? match[1] : null);

        lineLogCode = (matchFName ? matchFName[1] : null) + lineResult;

        // console.log(err)
        return logger;
    }

    // **Fungsi mendapatkan nama file log berdasarkan waktu**
    const getLogFileName = () => {
        const now = new Date();
        const pad = (num) => num.toString().padStart(2, '0');

        return `${customLogFileName}_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_` +
               `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.txt`;
    };

    // **Membuat atau memperbarui file log**
    const createLogFile = () => {
        if (logStream) {
            logStream.end(); // Tutup stream lama
        }

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        logFilePath = path.join(outputDir, getLogFileName());
        logStream = fs.createWriteStream(logFilePath, { flags: 'a', autoClose: false });

        writeLog('SYSTEM', '<<< --------------------  Create File -------------------- >>>');
    };

    // **Menulis log ke file dan console**
    const writeLog = (level, ...messages) => {
        if (!logStream) return console.error('[Logger] Error: Log stream tidak tersedia!');

        const logMessage = `${getTimeStamp()} [${level}] [${lineLogCode}] ${messages.join(' ')}`;

        logStream.write(logMessage + '\n');

        if (!silentMode) {
            console.log(logMessage);
        }
    };

    // **Mengatur folder log**
    const setFolderFilePath = (folderPath) => {
        outputDir = path.resolve(folderPath);
        // createLogFile();
        return logger; // Chain function
    };

    // **Mengatur nama file log kustom**
    const setCustomFile = (fileName) => {
        customLogFileName = fileName;
        // createLogFile();
        return logger; // Chain function
    };

    // **Menonaktifkan atau mengaktifkan log di console**
    const setSilentMode = (silent = true) => {
        silentMode = silent;
        return logger; // Chain function
    };

    // **Menutup file log dengan aman**
    const closeLog = () => {
        return new Promise((resolve) => {
            if (logStream) {
                writeLog('SYSTEM', '<<< -------------------- End Log -------------------- >>>');
                logStream.end(() => resolve());
            } else {
                resolve();
            }
        });
    };

    const startLog = () => createLogFile();

    // **Logger yang bisa dipakai berulang kali (Chainable)**
    const logger = {
        info: (...msg) => { writeLog('INFO', ...msg); return logger; },
        error: (...msg) => { writeLog('ERROR', ...msg); return logger; },
        debug: (...msg) => { writeLog('DEBUG', ...msg); return logger; },
        warn: (...msg) => { writeLog('WARN', ...msg); return logger; },
        setSilentMode,
        setFolderFilePath,
        setCustomFile,
        getLineCode,
        startLog,
        closeLog
    };

    // **Inisialisasi log pertama kali**
    // createLogFile();
    process.on('SIGINT', async () => {
        await closeLog();
        console.log('Menutup aplikasi...');
        console.log("tersimpan")
        process.exit(0);
    }); 

    process.on('exit', async () => {
        await closeLog();
    });

    return logger;
};

module.exports = createLogger;

















// const fs = require('fs');
// const path = require('path');

// class Logger {
//     constructor(folderPath = 'logs', fileName = 'defaultLog') {
//         this.outputDir = path.resolve(folderPath);
//         this.customLogFileName = fileName;
//         this.logStream = null;
//         this.logFilePath = null;
//         this.silent = false;
//         this.createLogFile();
//     }

//     getTimeStamp() {
//         return new Date().toLocaleTimeString('en-GB', { hour12: false });
//     }

//     getLogFileName() {
//         const now = new Date();
//         const pad = (num) => num.toString().padStart(2, '0');

//         return `${this.customLogFileName}_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_` +
//                `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.txt`;
//     }

//     createLogFile() {
//         if (this.logStream) {
//             this.logStream.end(); // Tutup stream lama sebelum membuat yang baru
//         }

//         if (!fs.existsSync(this.outputDir)) {
//             fs.mkdirSync(this.outputDir, { recursive: true });
//         }

//         this.logFilePath = path.join(this.outputDir, this.getLogFileName());
//         this.logStream = fs.createWriteStream(this.logFilePath, { flags: 'a', autoClose: false });

//         this.writeLog('SYSTEM', '<<< -------------------- Create File -------------------- >>>');
//     }

//     writeLog(level, ...messages) {
//         if (!this.logStream) return console.error('[Logger] Error: Log stream tidak tersedia!');

//         const logMessage = `${this.getTimeStamp()} ${level} ${messages.join(' ')}`;
//         this.logStream.write(logMessage + '\n');

//         if (!this.silent) {
//             console.log(logMessage);
//         }
//     }

//     setFolderFilePath(folderPath) {
//         this.outputDir = path.resolve(folderPath);
//         this.createLogFile();
//     }

//     setCustomFile(fileName) {
//         this.customLogFileName = fileName;
//         this.createLogFile();
//     }

//     setSilentMode(silent = true) {
//         this.silent = silent;
//     }

//     closeLog() {
//         return new Promise((resolve) => {
//             if (this.logStream) {
//                 this.writeLog('SYSTEM', '<<< -------------------- End Log -------------------- >>>');
//                 this.logStream.end(() => resolve());
//             } else {
//                 resolve();
//             }
//         });
//     }
// }

// // **Pastikan log ditutup saat program keluar**
// process.on('SIGINT', async () => {
//     console.log('Menutup aplikasi...');
//     process.exit(0);
// });

// module.exports = Logger;


















// const fs = require('fs');
// const path = require('path');
// const readline = require('readline');

// let outputDir = path.join(__dirname, 'logs'); // Folder log default
// let logStream = null;
// let logFilePath = null;
// let customLogFileName = null;
// const loggerOptions = { silent: false };

// // Fungsi untuk mendapatkan timestamp
// const getTimeStamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

// // Fungsi untuk mendapatkan nama file log berdasarkan waktu
// const getLogFileName = () => {
//     if (!customLogFileName) {
//         customLogFileName = "defaultLog";
//     }

//     const now = new Date();
//     const pad = (num) => num.toString().padStart(2, '0');

//     return `${customLogFileName}_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_` +
//            `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.txt`;
// };

// // **Fungsi untuk membuat/mengganti file log**
// const createLogFile = () => {
//     if (logStream) {
//         logStream.end(); // Tutup stream lama sebelum membuat yang baru
//     }

//     if (!fs.existsSync(outputDir)) {
//         fs.mkdirSync(outputDir, { recursive: true });
//     }

//     logFilePath = path.join(outputDir, getLogFileName());
//     logStream = fs.createWriteStream(logFilePath, { flags: 'a', autoClose: false });

//     writeLog('SYSTEM', '<<< --------------------  Create File -------------------- >>>');
// };

// // **Fungsi menulis log ke file dan console**
// const writeLog = (level, ...messages) => {
//     if (!logStream) return console.error('[Logger] Error: Log stream tidak tersedia!');

//     const logMessage = `${getTimeStamp()} ${level} ${messages.join(' ')}`;

//     logStream.write(logMessage + '\n');

//     if (!loggerOptions.silent) {
//         console.log(logMessage);
//     }
// };

// // **Fungsi untuk mengubah folder log dan membuat ulang file**
// const setFolderFilePath = (folderPath) => {
//     outputDir = path.resolve(folderPath);
//     // createLogFile(); // Buat ulang file log di folder baru
// };

// const setCustomFile = (fileName) => {
//     customLogFileName = fileName;
//     createLogFile();
// }

// const start = () => {
//     createLogFile()
// }

// // **Fungsi untuk mengaktifkan atau menonaktifkan console log**
// const setSilentMode = (silent = true) => {
//     loggerOptions.silent = silent;
// };

// // **Menutup log dengan benar sebelum keluar**
// const closeLog = () => {
//     return new Promise((resolve) => {
//         if (logStream) {
//             writeLog('SYSTEM', '<<< -------------------- End Log -------------------- >>>');
//             logStream.end(() => resolve());
//         } else {
//             resolve();
//         }
//     });
// };

// // **Pastikan log ditutup saat program keluar**
// process.on('SIGINT', async () => {
//     await closeLog();
//     console.log('Menutup aplikasi...');
//     console.log("tersimpan")
//     process.exit(0);
// });

// process.on('exit', async () => {
//     await closeLog();
// });

// // **Inisialisasi log pertama kali**
// // createLogFile();

// module.exports = {
//     info: (...msg) => writeLog('INFO', ...msg),
//     error: (...msg) => writeLog('ERROR', ...msg),
//     debug: (...msg) => writeLog('DEBUG', ...msg),
//     warn: (...msg) => writeLog('WARN', ...msg),
//     setSilentMode,
//     setFolderFilePath,
//     setCustomFile,
//     start
// };




















// const fs = require('fs');
// const path = require('path');
// const readline = require('readline');

// let outputDir = path.join(__dirname, 'logs'); // Folder log default
// let logStream = null;
// let logFilePath = null;
// const loggerOptions = { silent: false };

// // Fungsi untuk mendapatkan timestamp
// const getTimeStamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

// // Fungsi untuk mendapatkan nama file log berdasarkan waktu
// const getLogFileName = () => {
//     const now = new Date();
//     const pad = (num) => num.toString().padStart(2, '0');

//     return `log_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_` +
//            `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.txt`;
// };

// // Fungsi untuk membuat atau mengganti file log
// const createLogFile = () => {
//     if (!fs.existsSync(outputDir)) {
//         fs.mkdirSync(outputDir, { recursive: true });
//     }

//     logFilePath = path.join(outputDir, getLogFileName());
//     logStream = fs.createWriteStream(logFilePath, { flags: 'a', autoClose: false });

//     writeLog('SYSTEM', '<<< --------------------  Create File -------------------- >>>');
// };

// // Fungsi untuk menulis log
// const writeLog = (level, ...messages) => {
//     const logMessage = `${getTimeStamp()} ${level} ${messages.join(' ')}`;

//     if (logStream) {
//         logStream.write(logMessage + '\n');
//     }

//     if (!loggerOptions.silent) {
//         console.log(logMessage);
//     }
// };

// // Fungsi untuk mengubah folder output log
// const setFolderFilePath = (folderPath) => {
//     outputDir = path.resolve(folderPath);
//     createLogFile(); // Buat ulang log file di lokasi baru
// };

// // Fungsi untuk mengaktifkan atau menonaktifkan mode silent
// const setSilentMode = (silent = true) => {
//     loggerOptions.silent = silent;
// };

// // Fungsi untuk menutup log dengan benar saat program berhenti
// const closeLog = () => {
//     return new Promise((resolve) => {
//         if (logStream) {
//             writeLog('SYSTEM', '<<< -------------------- End Log -------------------- >>>');
//             logStream.end(() => resolve());
//         } else {
//             resolve();
//         }
//     });
// };

// // Fungsi untuk menangani perintah dari terminal
// const handleCommand = (command) => {
//     const args = command.trim().split(/\s+/);
//     const cmd = args.shift().toLowerCase();

//     switch (cmd) {
//         case 'help':
//             console.log('Daftar perintah: help, info <msg>, warn <msg>, error <msg>, debug <msg>, exit');
//             break;
//         case 'info':
//             writeLog('INFO', args.join(' '));
//             break;
//         case 'warn':
//             writeLog('WARN', args.join(' '));
//             break;
//         case 'error':
//             writeLog('ERROR', args.join(' '));
//             break;
//         case 'debug':
//             writeLog('DEBUG', args.join(' '));
//             break;
//         case 'exit':
//             console.log('Menutup logger...');
//             closeLog().then(() => process.exit(0));
//             break;
//         default:
//             console.log(`Perintah tidak dikenali: ${cmd}. Ketik "help" untuk daftar perintah.`);
//     }
// };

// // Menerima input dari console
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// console.log('Logger aktif! Ketik "help" untuk melihat daftar perintah.');
// rl.on('line', handleCommand);

// // Pastikan log ditutup dengan benar saat keluar dari program
// process.on('SIGINT', async () => {
//     console.log('Menutup aplikasi...');
//     await closeLog();
//     process.exit(0);
// });

// process.on('exit', async () => {
//     await closeLog();
// });

// // Jalankan saat pertama kali module di-load
// createLogFile();

// module.exports = {
//     info: (...msg) => writeLog('INFO', ...msg),
//     error: (...msg) => writeLog('ERROR', ...msg),
//     debug: (...msg) => writeLog('DEBUG', ...msg),
//     warn: (...msg) => writeLog('WARN', ...msg),
//     setSilentMode,
//     setFolderFilePath
// };














// const fs = require('fs');
// const path = require('path');

// let outputDir = path.join(__dirname, 'logs'); // Default folder log
// let logStream = null;
// let logFilePath = null;
// const loggerOptions = { silent: false };

// // Fungsi untuk mendapatkan timestamp dalam format HH:MM:SS
// const getTimeStamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

// // Fungsi untuk mendapatkan nama file log berdasarkan waktu saat ini
// const getLogFileName = () => {
//     const now = new Date();
//     const pad = (num) => num.toString().padStart(2, '0');

//     return `log_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_` +
//            `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.txt`;
// };

// // Fungsi untuk membuat atau mengganti file log
// const createLogFile = () => {
//     if (!fs.existsSync(outputDir)) {
//         fs.mkdirSync(outputDir, { recursive: true });
//     }

//     logFilePath = path.join(outputDir, getLogFileName());
//     logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

//     writeLog('lv0', '<<< --------------------  Create File -------------------- >>>');
// };

// // Fungsi untuk menulis log ke file dan (opsional) ke console
// const writeLog = (level, ...messages) => {
//     const logMessage = `${getTimeStamp()} ${level} ${messages.join(' ')}`;
    
//     if (logStream) {
//         logStream.write(logMessage + '\n', 'utf8', () => {
//             logStream.emit('flushed'); // Menandai bahwa data sudah ditulis
//         });
//     }

//     if (!loggerOptions.silent) {
//         console.log(logMessage);
//     }
// };

// // Fungsi untuk mengubah folder output log
// const setFolderFilePath = (folderPath) => {
//     outputDir = path.resolve(folderPath);
//     createLogFile(); // Buat ulang log file di lokasi baru
// };

// // Fungsi untuk mengaktifkan atau menonaktifkan mode silent
// const setSilentMode = (silent = true) => {
//     loggerOptions.silent = silent;
// };

// // Fungsi untuk menutup log saat program berhenti
// const closeLog = () => {
//     return new Promise((resolve) => {
//         if (logStream) {
//             writeLog('lv0', '<<< -------------------- End Log -------------------- >>>');

//             logStream.once('flushed', () => {
//                 logStream.end(() => {
//                     resolve(); // Pastikan file log ditutup sebelum keluar
//                 });
//             });
//         } else {
//             resolve();
//         }
//     });
// };

// // Tangkap event saat program berhenti dengan Ctrl + C
// process.on('SIGINT', async () => {
//     await closeLog();
//     process.exit(0);
// });

// // Jalankan saat pertama kali module di-load
// createLogFile();

// module.exports = {
//     info: (...msg) => writeLog('INFO', ...msg),
//     error: (...msg) => writeLog('ERROR', ...msg),
//     debug: (...msg) => writeLog('DEBUG', ...msg),
//     warn: (...msg) => writeLog('WARN', ...msg),
//     setSilentMode,
//     setFolderFilePath
// };








// const fs = require('fs');
// const path = require('path');

// // Folder tujuan untuk menyimpan log
// const OUTPUT_DIR = path.join(__dirname, 'logs');
// if (!fs.existsSync(OUTPUT_DIR)) {
//     fs.mkdirSync(OUTPUT_DIR, { recursive: true });
// }

// // Fungsi untuk mendapatkan timestamp dalam format HH:MM:SS
// const getTimeStamp = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

// // Fungsi untuk mendapatkan nama file log berdasarkan waktu saat ini
// const getLogFileName = () => {
//     const now = new Date();
//     const pad = (num) => num.toString().padStart(2, '0');

//     return `log_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_` +
//            `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.txt`;
// };

// // Buat nama file log hanya sekali per sesi
// const logFilePath = path.join(OUTPUT_DIR, getLogFileName());

// // Buat stream untuk menulis log secara real-time
// const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// // Mode konfigurasi logger (default aktif `console.log()`)
// const loggerOptions = { silent: false };

// // Fungsi untuk menulis log
// const writeLog = (level, ...messages) => {
//     const logMessage = `${getTimeStamp()} ${level} ${messages.join(' ')}`;

//     // Simpan ke file log
//     logStream.write(logMessage + '\n');

//     // Cetak ke console jika mode bukan "silent"
//     if (!loggerOptions.silent) {
//         console.log(logMessage);
//     }
// };

// // Tulis info pembuatan file log
// writeLog('lv0', '<<< --------------------  Create File -------------------- >>>');

// // Fungsi untuk mengaktifkan atau menonaktifkan mode silent
// const setSilentMode = (silent = true) => {
//     loggerOptions.silent = silent;
// };

// // Fungsi untuk menutup log saat program berhenti
// const closeLog = () => {
//     writeLog('lv0', '<<< -------------------- End Log -------------------- >>>');
//     logStream.end();
// };

// // Tangkap event saat program berhenti
// process.on('exit', closeLog);
// process.on('SIGINT', () => {
//     closeLog();
//     process.exit();
// });

// // Export fungsi logger
// module.exports = {
//     info: (...msg) => writeLog('INFO', ...msg),
//     error: (...msg) => writeLog('ERROR', ...msg),
//     debug: (...msg) => writeLog('DEBUG', ...msg),
//     warn: (...msg) => writeLog('WARN', ...msg),
//     setSilentMode,
// };













// const fs = require('fs');
// const path = require('path');

// // Folder tujuan untuk menyimpan log
// const OUTPUT_DIR = path.join(__dirname, 'logs');
// if (!fs.existsSync(OUTPUT_DIR)) {
//     fs.mkdirSync(OUTPUT_DIR, { recursive: true });
// }

// // Fungsi untuk mendapatkan timestamp dalam format HH:MM:SS
// const getTimeStamp = () => {
//     return new Date().toLocaleTimeString('en-GB', { hour12: false });
// };

// // Fungsi untuk mendapatkan nama file log berdasarkan waktu saat ini
// const getLogFileName = () => {
//     const now = new Date();
//     const pad = (num) => num.toString().padStart(2, '0');

//     return `log_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_` +
//            `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}.txt`;
// };

// // Buat nama file log hanya sekali per sesi
// const logFilePath = path.join(OUTPUT_DIR, getLogFileName());

// // Fungsi untuk mencetak ke console dan menyimpan ke file log
// const logToFile = (...messages) => {
//     const logMessage = `${getTimeStamp()} lv0 ${messages.join(' ')}`;

//     // Cetak ke console
//     console.log(logMessage);

//     // Simpan ke file log
//     fs.appendFileSync(logFilePath, logMessage + '\n', 'utf8');
// };

// // Override console.log agar semua log otomatis tersimpan
// console.log = logToFile;

// module.exports = logToFile;
