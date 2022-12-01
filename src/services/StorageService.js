const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

class StorageService {
  constructor(folder) {
    this._folder = folder;

    if (fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    this._pool = new Pool();
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const filepath = path.join(this._folder, filename);

    const fileStream = fs.createWriteStream(filepath);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }
}

module.exports = StorageService;
