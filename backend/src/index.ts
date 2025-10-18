import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import session from "cookie-session";
import passport from "passport";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import { asyncHandler } from "./middlewares/asyncHandler.middleware";

import "./config/passport.config";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";

const app = express();
const BASE_PATH = config.BASE_PATH;

// ✅ STEP 1: Body parsers first
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ STEP 2: CORS before session (IMPORTANT!)
app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ✅ STEP 3: Session configuration
app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false, // FALSE for localhost (no HTTPS)
    httpOnly: true,
    sameSite: 'lax'
  })
);

// ✅ STEP 4: Passport
app.use(passport.initialize());
app.use(passport.session());

// ✅ STEP 5: Debug middleware
app.use((req, res, next) => {
  console.log('📍 Request:', req.method, req.path);
  console.log('🔐 Session:', req.session);
  console.log('👤 User:', req.user);
  next();
});

// ✅ Root route (for health check)
app.get('/', (req: Request, res: Response) => {
  res.status(HTTPSTATUS.OK).json({
    message: 'Team Management API Running',
    version: '1.0.0',
    endpoints: {
      auth: `${BASE_PATH}/auth`,
      user: `${BASE_PATH}/user`,
      workspace: `${BASE_PATH}/workspace`
    }
  });
});

// ✅ Routes
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);

// ✅ Error handler
app.use(errorHandler);

app.listen(config.PORT, async () => {
  console.log(`🚀 Server listening on port ${config.PORT} in ${config.NODE_ENV} mode`);
  await connectDatabase();
});

export default app;
