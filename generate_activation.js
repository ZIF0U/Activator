const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Save keys to files (optional, for backup)
fs.writeFileSync('public_key.pem', publicKey);
fs.writeFileSync('private_key.pem', privateKey);

// Get deviceId from command line or use a default for testing
const deviceId = process.argv[2] || 'test-device-id';  // Pass deviceId as arg, e.g., node generate_activation.js <deviceId>
const issuedAt = Date.now();

// Create payload
const payload = { deviceId, issuedAt };
const payloadJson = JSON.stringify(payload);
const payloadB64 = Buffer.from(payloadJson).toString('base64');

// Sign
const signer = crypto.createSign('RSA-SHA256');
signer.update(payloadB64);
const signature = signer.sign(privateKey, 'base64');

const activationCode = `${payloadB64}.${signature}`;

console.log('Activation Code for deviceId:', deviceId);
console.log(activationCode);
