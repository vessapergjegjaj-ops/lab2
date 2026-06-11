const crypto = require("crypto");

const base64UrlEncode = (value) => {
  return Buffer.from(value).toString("base64url");
};

const base64UrlJson = (value) => {
  return base64UrlEncode(JSON.stringify(value));
};

const sign = (payload, secret, expiresInSeconds) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const signingInput = base64UrlJson(header) + "." + base64UrlJson(body);
  const signature = crypto.createHmac("sha256", secret).update(signingInput).digest("base64url");
  return signingInput + "." + signature;
};

const verify = (token, secret) => {
  const parts = String(token || "").split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const signingInput = parts[0] + "." + parts[1];
  const expectedSignature = crypto.createHmac("sha256", secret).update(signingInput).digest("base64url");
  const actualSignature = parts[2];

  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(actualSignature);
  if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
    throw new Error("Invalid token signature");
  }

  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return payload;
};

module.exports = { sign, verify };
