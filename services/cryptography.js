const crypto = require('crypto-js');
const bcrypt = require('bcryptjs');

const secret = process.env.SECRET;

let encrypt = (plaintext) => {
  return crypto.AES.encrypt(plaintext, secret).toString();
};

let decrypt = (ciphertext) => {
  return crypto.AES.decrypt(ciphertext, secret).toString(crypto.enc.Utf8);
};

let hash = (plaintext) => {
  return bcrypt.hashSync(plaintext, 10);
};

let compare = (plaintext, hash) => {
  return bcrypt.compareSync(plaintext, hash);
}

module.exports = {
  encrypt,
  decrypt,
  hash,
  compare
}
