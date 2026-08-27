const authService = require("../services/auth.service");
const tokenService = require("../services/token.service");
const auditService = require("../services/audit.service");

async function login(req, res, next) {
  try {
    const { serviceNumber, password } = req.body;
    if (!serviceNumber || !password) {
      return res.status(400).json({ error: "serviceNumber and password are required" });
    }

    const user = await authService.findUserByServiceNumber(serviceNumber);

    // Constant-shape response whether the user exists or not, to avoid
    // leaking which service numbers are valid.
    const passwordOk = user
      ? await authService.verifyPassword(password, user.password_hash)
      : false;

    if (!user || !passwordOk) {
      await auditService.record({
        actorUserId: user ? user.id : null,
        action: "auth.login.failed",
        allowed: false,
        metadata: { serviceNumber },
      });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const accessToken = tokenService.signAccessToken({
      id: user.id,
      role: user.role,
      unit: user.unit,
    });
    const refreshToken = await tokenService.issueRefreshToken(user.id);

    await auditService.record({
      actorUserId: user.id,
      action: "auth.login.success",
      allowed: true,
    });

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        displayName: user.display_name,
        role: user.role,
        unit: user.unit,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken is required" });
    }

    const { userId, newRefreshToken } = await tokenService.rotateRefreshToken(
      refreshToken
    );
    const user = await authService.findUserById(userId);
    if (!user) {
      return res.status(401).json({ error: "User no longer active" });
    }

    const accessToken = tokenService.signAccessToken({
      id: user.id,
      role: user.role,
      unit: user.unit,
    });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    // Invalid/reused refresh tokens are a client error, not a server one.
    return res.status(401).json({ error: err.message });
  }
}

async function logout(req, res, next) {
  try {
    await tokenService.revokeAllRefreshTokens(req.user.id);
    await auditService.record({
      actorUserId: req.user.id,
      action: "auth.logout",
      allowed: true,
    });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { login, refresh, logout };
