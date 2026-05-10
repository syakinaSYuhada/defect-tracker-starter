#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const zodDir = path.join(__dirname, '../node_modules/zod');
const zodIndexPath = path.join(zodDir, 'index.js');
const zodPackagePath = path.join(zodDir, 'package.json');

// Create zod directory if it doesn't exist
if (!fs.existsSync(zodDir)) {
  fs.mkdirSync(zodDir, { recursive: true });
}

// Create package.json for zod shim
const pkgJson = {
  name: 'zod',
  version: '4.0.0-shim',
  main: 'index.js'
};

if (!fs.existsSync(zodPackagePath)) {
  fs.writeFileSync(zodPackagePath, JSON.stringify(pkgJson, null, 2), 'utf8');
}

// Create index.js for zod shim (minimal implementation)
const zodShim = `// Minimal Zod-like shim sufficient for app validation in tests
const makeSchema = (typeCheck) => {
  const schema = {
    _typeCheck: typeCheck,
    _opts: {},
    parse(value) {
      // handle default
      if (value === undefined && this._opts.default !== undefined) return this._opts.default;
      if (value === undefined && this._opts.nullable) return null;
      if (value === undefined && this._opts.optional) return undefined;
      if (value === undefined) {
        throw new Error('Required');
      }
      let v = value;
      if (this._opts.transform) v = this._opts.transform(v);
      if (!this._typeCheck(v)) throw new Error('Invalid type');
      if (this._opts.min != null && typeof v === 'string' && v.length < this._opts.min) throw new Error('Too small');
      if (this._opts.max != null && typeof v === 'string' && v.length > this._opts.max) throw new Error('Too large');
      if (this._opts.int && !Number.isInteger(Number(v))) throw new Error('Not an integer');
      if (this._opts.positive && Number(v) <= 0) throw new Error('Not positive');
      if (this._opts.minNum != null && Number(v) < this._opts.minNum) throw new Error('Number too small');
      if (this._opts.regex && typeof v === 'string' && !this._opts.regex.test(v)) throw new Error('Pattern mismatch');
      if (this._opts.enum && !this._opts.enum.includes(v)) throw new Error('Invalid enum');
      return v;
    }
  };

  // chain helpers
  schema.min = function(n) { this._opts.min = n; return this; };
  schema.max = function(n) { this._opts.max = n; return this; };
  schema.int = function() { this._opts.int = true; return this; };
  schema.positive = function() { this._opts.positive = true; return this; };
  schema.nullable = function() { this._opts.nullable = true; return this; };
  schema.optional = function() { this._opts.optional = true; return this; };
  schema.default = function(v) { this._opts.default = v; return this; };
  schema.transform = function(fn) { this._opts.transform = fn; return this; };
  schema.regex = function(rx) { this._opts.regex = rx; return this; };
  schema.minNum = function(n) { this._opts.minNum = n; return this; };
  return schema;
};

const z = {
  string: () => makeSchema(v => typeof v === 'string'),
  number: () => makeSchema(v => !Number.isNaN(Number(v)) && typeof Number(v) === 'number'),
  enum: (arr) => {
    const s = makeSchema(v => typeof v === 'string' || typeof v === 'number');
    s._opts.enum = arr;
    return s;
  },
  object: (shape) => {
    return {
      parse(obj) {
        if (typeof obj !== 'object' || obj === null) throw new Error('Expected object');
        const out = {};
        for (const k of Object.keys(shape)) {
          try {
            const schema = shape[k];
            const val = obj[k];
            out[k] = schema.parse(val);
          } catch (err) {
            // rethrow with field context
            throw new Error(\`\${k}: \${err.message}\`);
          }
        }
        return out;
      },
      // allow partial
      partial() {
        const s = z.object(shape);
        s.parse = function(obj) {
          if (typeof obj !== 'object' || obj === null) throw new Error('Expected object');
          const out = {};
          for (const k of Object.keys(shape)) {
            const schema = shape[k];
            if (Object.prototype.hasOwnProperty.call(obj, k)) {
              out[k] = schema.parse(obj[k]);
            }
          }
          return out;
        };
        return s;
      }
    };
  }
};

module.exports = { z };
`;

if (!fs.existsSync(zodIndexPath)) {
  fs.writeFileSync(zodIndexPath, zodShim, 'utf8');
}

console.log('Zod shim initialized at', zodDir);
