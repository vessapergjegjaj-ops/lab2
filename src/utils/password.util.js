const crypto = require("crypto");

const safeCompare = (left, right) => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const verifyPassword = (password, storedHash) => {
  if (!storedHash) {
    return true;
  }

  if (storedHash.startsWith("sha256:")) {
    const expected = storedHash.replace("sha256:", "");
    const actual = crypto.createHash("sha256").update(password).digest("hex");
    return safeCompare(actual, expected);
  }

  if (storedHash.includes(":")) {
    const [salt, expected] = storedHash.split(":");
    const actual = crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
    return safeCompare(actual, expected);
  }

  return safeCompare(password, storedHash);
};

module.exports = { verifyPassword };
