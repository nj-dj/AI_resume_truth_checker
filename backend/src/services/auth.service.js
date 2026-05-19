import crypto from "node:crypto";
import { promisify } from "node:util";
import { StatusCodes } from "http-status-codes";

import { env } from "../config/env.js";
import { isDatabaseConnected } from "../database/mongodb.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";

const scrypt = promisify(crypto.scrypt);
const memoryUsersByEmail = new Map();
const memoryUsersById = new Map();

const base64UrlEncode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");

const base64UrlDecode = (value) => JSON.parse(Buffer.from(value, "base64url").toString("utf8"));

const sign = (value) => crypto.createHmac("sha256", env.authJwtSecret).update(value).digest("base64url");

const normalizeUser = (user) => ({
  id: user._id?.toString?.() ?? user.id,
  name: user.name ?? "",
  email: user.email,
});

const createToken = ({ user, type, ttlMs }) => {
  const now = Date.now();
  const header = base64UrlEncode({ alg: "HS256", typ: "JWT" });
  const payload = base64UrlEncode({
    sub: normalizeUser(user).id,
    email: user.email,
    name: user.name ?? "",
    type,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + ttlMs) / 1000),
  });
  const body = `${header}.${payload}`;

  return {
    token: `${body}.${sign(body)}`,
    expiresAt: now + ttlMs,
  };
};

const findUserByEmail = async (email) => {
  if (isDatabaseConnected()) {
    return User.findOne({ email });
  }

  return memoryUsersByEmail.get(email) ?? null;
};

const findUserById = async (id) => {
  if (isDatabaseConnected()) {
    return User.findById(id);
  }

  return memoryUsersById.get(id) ?? null;
};

const createUser = async ({ name, email, passwordHash }) => {
  if (isDatabaseConnected()) {
    return User.create({ name, email, passwordHash });
  }

  const user = {
    id: crypto.randomUUID(),
    name,
    email,
    passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  memoryUsersByEmail.set(email, user);
  memoryUsersById.set(user.id, user);
  return user;
};

const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16).toString("base64url");
  const key = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${key.toString("base64url")}`;
};

const verifyPassword = async (password, storedHash) => {
  const [algorithm, salt, hash] = storedHash.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const key = await scrypt(password, salt, 64);
  const expected = Buffer.from(hash, "base64url");

  return expected.length === key.length && crypto.timingSafeEqual(expected, key);
};

const verifyToken = (token, expectedType = "access") => {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid authentication token");
  }

  const body = `${header}.${payload}`;
  const expectedSignature = sign(body);
  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid authentication token");
  }

  const decoded = base64UrlDecode(payload);
  if (decoded.type !== expectedType) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid authentication token type");
  }

  if (!decoded.exp || decoded.exp * 1000 <= Date.now()) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication token expired");
  }

  return decoded;
};

const createSession = (user) => {
  const accessTokenTtlMs = env.authAccessTokenTtlMinutes * 60 * 1000;
  const refreshTokenTtlMs = env.authRefreshTokenTtlDays * 24 * 60 * 60 * 1000;
  const access = createToken({ user, type: "access", ttlMs: accessTokenTtlMs });
  const refresh = createToken({ user, type: "refresh", ttlMs: refreshTokenTtlMs });

  return {
    accessToken: access.token,
    refreshToken: refresh.token,
    expiresAt: access.expiresAt,
    user: normalizeUser(user),
  };
};

export const authService = {
  async signup(payload) {
    const existingUser = await findUserByEmail(payload.email);
    if (existingUser) {
      throw new ApiError(StatusCodes.CONFLICT, "An account already exists for this email");
    }

    const passwordHash = await hashPassword(payload.password);

    try {
      const user = await createUser({
        name: payload.name,
        email: payload.email,
        passwordHash,
      });

      return createSession(user);
    } catch (error) {
      if (error?.code === 11000) {
        throw new ApiError(StatusCodes.CONFLICT, "An account already exists for this email");
      }

      throw error;
    }
  },

  async login({ email, password }) {
    const user = await findUserByEmail(email);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }

    return createSession(user);
  },

  async refresh(refreshToken) {
    const decoded = verifyToken(refreshToken, "refresh");
    const user = await findUserById(decoded.sub);

    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "User account no longer exists");
    }

    return createSession(user);
  },

  async getUserFromAccessToken(accessToken) {
    const decoded = verifyToken(accessToken, "access");
    const user = await findUserById(decoded.sub);

    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, "User account no longer exists");
    }

    return normalizeUser(user);
  },
};
