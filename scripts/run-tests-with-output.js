#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, '..', 'test-results.txt');

const jest = spawn('npx', ['jest', '--runInBand', '--forceExit'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  cwd: path.join(__dirname, '..')
});

const writeStream = fs.createWriteStream(outputFile, { flags: 'w' });

jest.stdout.pipe(writeStream);
jest.stderr.pipe(writeStream);

jest.on('close', (code) => {
  writeStream.write(`\n\nTest process exited with code: ${code}\n`);
  writeStream.end();
  console.log(`Test output saved to ${outputFile}`);
  process.exit(code);
});

// Also pipe to console for realtime feedback
jest.stdout.pipe(process.stdout);
jest.stderr.pipe(process.stderr);
