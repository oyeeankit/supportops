const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, '..', 'public', 'models');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const file = path.join(dir, 'avatar.glb');

// Candidate URLs for realistic 3D GLTF human model
const candidateUrls = [
  'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Xbot.glb',
  'https://cdn.jsdelivr.net/gh/mrdoob/three.js@master/examples/models/gltf/Xbot.glb',
  'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMan/glTF-Binary/CesiumMan.glb'
];

async function tryDownload(index = 0) {
  if (index >= candidateUrls.length) {
    console.error('All candidate URLs failed.');
    process.exit(1);
  }

  const url = candidateUrls[index];
  console.log(`Trying download from: ${url}`);

  const req = https.get(url, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      downloadUrl(res.headers.location, index);
      return;
    }
    if (res.statusCode !== 200) {
      console.warn(`URL failed with status ${res.statusCode}, trying next...`);
      tryDownload(index + 1);
      return;
    }

    const stream = fs.createWriteStream(file);
    res.pipe(stream);
    stream.on('finish', () => {
      stream.close();
      const stats = fs.statSync(file);
      console.log(`Successfully downloaded GLB model! (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    });
  });

  req.on('error', (err) => {
    console.warn(`Network error for ${url}: ${err.message}, trying next...`);
    tryDownload(index + 1);
  });
}

function downloadUrl(url, index) {
  https.get(url, (res) => {
    if (res.statusCode !== 200) {
      tryDownload(index + 1);
      return;
    }
    const stream = fs.createWriteStream(file);
    res.pipe(stream);
    stream.on('finish', () => {
      stream.close();
      const stats = fs.statSync(file);
      console.log(`Successfully downloaded GLB model! (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
    });
  }).on('error', () => tryDownload(index + 1));
}

tryDownload(0);
