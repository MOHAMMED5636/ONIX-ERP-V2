# Backend Implementation Guide for ONIX ERP System

## 📋 Current Technology Stack

### Frontend (React)
- **Framework**: React 18.2.0
- **Routing**: React Router DOM 6.30.1
- **Styling**: Tailwind CSS 3.3.3
- **UI Components**: Radix UI, Heroicons
- **State Management**: React Hooks (useState, useEffect, Context API)
- **Real-time**: Socket.io-client 4.8.1
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Data Storage**: Currently using localStorage (needs backend migration)

### Expected Backend Stack
Based on API design documents and frontend expectations:
- **Runtime**: Node.js (v18+ recommended)
- **Framework**: Express.js
- **Language**: TypeScript (backend/tsconfig.json exists)
- **Database**: PostgreSQL or MongoDB (recommended: PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Multer + Local/Cloud Storage (AWS S3, Azure Blob)
- **Email**: Nodemailer or SendGrid
- **Real-time**: Socket.io
- **ORM/ODM**: Prisma (PostgreSQL) or Mongoose (MongoDB)

---

## 🏗️ Backend Architecture

### Recommended Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # DB connection
│   │   ├── env.ts               # Environment variables
│   │   └── email.ts             # Email configuration
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── clients.controller.ts
│   │   ├── tenders.controller.ts
│   │   ├── documents.controller.ts
│   │   ├── projects.controller.ts
│   │   └── users.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT verification
│   │   ├── role.middleware.ts   # RBAC
│   │   ├── error.middleware.ts  # Error handling
│   │   └── upload.middleware.ts # File upload
│   ├── models/
│   │   ├── User.ts
│   │   ├── Client.ts
│   │   ├── Tender.ts
│   │   ├── Document.ts
│   │   └── Project.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── clients.routes.ts
│   │   ├── tenders.routes.ts
│   │   ├── documents.routes.ts
│   │   └── projects.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   ├── file.service.ts
│   │   └── token.service.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── tender.types.ts
│   │   └── common.types.ts
│   └── app.ts                   # Express app setup
│   └── server.ts                # Server entry point
├── uploads/                     # File upload directory
├── .env                         # Environment variables
├── .env.example                 # Example env file
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Step-by-Step Implementation

### Step 1: Initialize Backend Project

```bash
cd ONIX-ERP-V2/backend
npm init -y
```

### Step 2: Install Dependencies

```bash
# Core dependencies
npm install express cors dotenv helmet morgan
npm install jsonwebtoken bcryptjs
npm install multer
npm install nodemailer
npm install socket.io
npm install express-validator

# Database (Choose one)
# Option A: PostgreSQL with Prisma
npm install @prisma/client
npm install -D prisma

# Option B: MongoDB with Mongoose
npm install mongoose

# TypeScript
npm install -D typescript @types/node @types/express
npm install -D @types/cors @types/jsonwebtoken @types/bcryptjs
npm install -D @types/multer @types/nodemailer
npm install -D ts-node nodemon

# Development tools
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint prettier
```

### Step 3: Create package.json Scripts

```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio"
  }
}
```

### Step 4: Environment Configuration

Create `.env` file:
```env
# Server
NODE_ENV=development
PORT=3001
API_BASE_URL=http://localhost:3001/api

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Database (PostgreSQL example)
DATABASE_URL=postgresql://user:password@localhost:5432/onix_erp?schema=public

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@onixgroup.ae

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,jpg,jpeg,png,dwg,dxf

# AWS S3 (Optional - for cloud storage)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=onix-erp-documents

# Socket.io
SOCKET_PORT=3002
```

### Step 5: Database Schema Design

#### Using Prisma (PostgreSQL) - Recommended

Create `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  firstName     String
  lastName      String
  role          UserRole @default(ADMIN)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  assignedTenders TenderInvitation[] @relation("AssignedEngineer")
  createdProjects  Project[]
  
  @@map("users")
}

enum UserRole {
  ADMIN
  TENDER_ENGINEER
  PROJECT_MANAGER
  CONTRACTOR
}

model Client {
  id              String   @id @default(uuid())
  referenceNumber String   @unique
  name            String
  isCorporate     String   // "Person" or "Company"
  leadSource      String?
  rank            String?
  email           String?
  phone           String?
  address         String?
  nationality     String?
  idNumber        String?
  passportNumber  String?
  birthDate       DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  projects        Project[]
  tenders         Tender[]
  
  @@map("clients")
}

model Project {
  id              String   @id @default(uuid())
  name            String
  referenceNumber String   @unique
  clientId        String?
  client          Client?  @relation(fields: [clientId], references: [id])
  owner           String?
  description     String?
  status          String   @default("Open")
  deadline        DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  createdBy       String?
  creator         User?    @relation(fields: [createdBy], references: [id])
  tenders         Tender[]
  documents       Document[]
  
  @@map("projects")
}

model Tender {
  id                      String   @id @default(uuid())
  projectId               String
  project                 Project  @relation(fields: [projectId], references: [id])
  name                    String
  referenceNumber         String   @unique
  clientId                String?
  client                  Client?  @relation(fields: [clientId], references: [id])
  status                  TenderStatus @default(OPEN)
  
  // Tender Details
  scopeOfWork             String?
  technicalDrawingsLink   String?
  hasInvitationFees       Boolean  @default(false)
  invitationFeeAmount     Decimal?
  tenderAcceptanceDeadline DateTime?
  bidSubmissionDeadline  DateTime?
  additionalNotes         String?
  
  // Attachment
  attachmentFile          String?  // File path or URL
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  // Relations
  invitations             TenderInvitation[]
  technicalSubmissions    TechnicalSubmission[]
  
  @@map("tenders")
}

enum TenderStatus {
  OPEN
  CLOSED
  AWARDED
  REJECTED
  CANCELLED
}

model TenderInvitation {
  id              String   @id @default(uuid())
  tenderId        String
  tender          Tender   @relation(fields: [tenderId], references: [id])
  engineerId      String
  engineer        User     @relation("AssignedEngineer", fields: [engineerId], references: [id])
  invitationToken String  @unique
  status          InvitationStatus @default(PENDING)
  assignedAt      DateTime @default(now())
  acceptedAt      DateTime?
  
  @@map("tender_invitations")
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
}

model TechnicalSubmission {
  id              String   @id @default(uuid())
  tenderId        String
  tender          Tender   @relation(fields: [tenderId], references: [id])
  engineerId      String
  submittedAt     DateTime @default(now())
  status          SubmissionStatus @default(SUBMITTED)
  
  // Relations
  documents       Document[]
  
  @@map("technical_submissions")
}

enum SubmissionStatus {
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
}

model Document {
  id              String   @id @default(uuid())
  module          String   // "PRJ", "HR", "CLI", "FIN", "GEN"
  entityCode      String   // Reference number
  documentType    String   // "CNTR", "DRW", "RPT", etc.
  year            Int
  sequence        String
  referenceCode   String   @unique
  fileName        String
  filePath        String
  fileUrl         String?
  fileSize        Int
  mimeType        String
  
  // Relations
  projectId       String?
  project         Project? @relation(fields: [projectId], references: [id])
  submissionId   String?
  submission      TechnicalSubmission? @relation(fields: [submissionId], references: [id])
  
  uploadedBy     String?
  uploadedAt     DateTime @default(now())
  
  @@map("documents")
}
```

### Step 6: Core Backend Files

#### `src/config/database.ts`
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;
```

#### `src/config/env.ts`
```typescript
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  email: {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@onixgroup.ae',
  },
  
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [],
  },
};
```

#### `src/middleware/auth.middleware.ts`
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, config.jwt.secret) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};
```

#### `src/middleware/role.middleware.ts`
```typescript
import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
    }
    
    next();
  };
};
```

#### `src/services/email.service.ts`
```typescript
import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false,
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const sendEmail = async (to: string, subject: string, html: string, attachments?: any[]) => {
  try {
    const info = await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
      attachments,
    });
    
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};

export const sendTenderInvitationEmail = async (
  engineerEmail: string,
  engineerName: string,
  tenderData: any,
  invitationLink: string,
  attachmentPath?: string
) => {
  const subject = `Tender Invitation: ${tenderData.name}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Tender Invitation</h1>
        </div>
        <div class="content">
          <p>Dear ${engineerName},</p>
          <p>You have been invited to participate in the following tender opportunity:</p>
          <hr>
          <h3>TENDER DETAILS</h3>
          <p><strong>Project Name:</strong> ${tenderData.name}</p>
          <p><strong>Reference Number:</strong> ${tenderData.referenceNumber || 'N/A'}</p>
          <p><strong>Client:</strong> ${tenderData.client || 'N/A'}</p>
          <hr>
          <p>Please click on the link below to view the complete tender details and submit your technical submission:</p>
          <a href="${invitationLink}" class="button">View Tender Invitation</a>
          <p>You will be able to:</p>
          <ul>
            <li>Review all tender requirements</li>
            <li>Upload technical documentation</li>
            <li>Submit your bid response</li>
            <li>Track submission status</li>
          </ul>
          <p>If you have any questions, please contact our tender management team.</p>
          <p>Best regards,<br>ONIX Engineering Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const attachments = attachmentPath ? [{ path: attachmentPath }] : undefined;
  
  return await sendEmail(engineerEmail, subject, html, attachments);
};
```

#### `src/controllers/auth.controller.ts`
```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/auth.middleware';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    
    // Find user by email and role
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user || user.role !== role) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
```

#### `src/controllers/tenders.controller.ts`
```typescript
import { Response } from 'express';
import prisma from '../config/database';
import { generateInvitationToken } from '../utils/token';
import { sendTenderInvitationEmail } from '../services/email.service';
import { AuthRequest } from '../middleware/auth.middleware';

export const assignTenderToEngineer = async (req: AuthRequest, res: Response) => {
  try {
    const { tenderId, engineerId } = req.body;
    
    // Generate secure invitation token
    const invitationToken = generateInvitationToken(tenderId, engineerId);
    const invitationLink = `${process.env.FRONTEND_URL}/tender/invitation/${invitationToken}`;
    
    // Get tender and engineer details
    const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
    const engineer = await prisma.user.findUnique({ where: { id: engineerId } });
    
    if (!tender || !engineer) {
      return res.status(404).json({ success: false, message: 'Tender or Engineer not found' });
    }
    
    // Create invitation record
    const invitation = await prisma.tenderInvitation.create({
      data: {
        tenderId,
        engineerId,
        invitationToken,
        status: 'PENDING',
      },
    });
    
    // Send invitation email
    try {
      await sendTenderInvitationEmail(
        engineer.email,
        `${engineer.firstName} ${engineer.lastName}`,
        tender,
        invitationLink,
        tender.attachmentFile || undefined
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue even if email fails
    }
    
    res.json({
      success: true,
      data: {
        invitation,
        invitationLink,
      },
    });
  } catch (error) {
    console.error('Assign tender error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const acceptInvitation = async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.params;
    
    // Find invitation by token
    const invitation = await prisma.tenderInvitation.findUnique({
      where: { invitationToken: token },
      include: { tender: true, engineer: true },
    });
    
    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }
    
    if (invitation.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: 'Invitation already processed' });
    }
    
    // Verify engineer matches logged-in user
    if (invitation.engineerId !== req.user!.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    
    // Update invitation status
    await prisma.tenderInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
    });
    
    res.json({ success: true, message: 'Invitation accepted' });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
```

#### `src/routes/tenders.routes.ts`
```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import * as tendersController from '../controllers/tenders.controller';

const router = Router();

// Assign tender to engineer (Admin only)
router.post('/assign', authenticate, requireRole('ADMIN'), tendersController.assignTenderToEngineer);

// Accept invitation (Engineer)
router.post('/invitation/:token/accept', authenticate, requireRole('TENDER_ENGINEER'), tendersController.acceptInvitation);

// Get invitation by token
router.get('/invitation/:token', tendersController.getInvitationByToken);

export default router;
```

#### `src/app.ts`
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';

// Routes
import authRoutes from './routes/auth.routes';
import clientsRoutes from './routes/clients.routes';
import tendersRoutes from './routes/tenders.routes';
import documentsRoutes from './routes/documents.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/tenders', tendersRoutes);
app.use('/api/documents', documentsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

export default app;
```

#### `src/server.ts`
```typescript
import app from './app';
import { config } from './config/env';
import prisma from './config/database';

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('Process terminated');
  });
});
```

---

## 📝 Database Setup

### Initialize Prisma
```bash
cd backend
npx prisma init
```

### Run Migrations
```bash
npx prisma migrate dev --name init
```

### Seed Database (Optional)
Create `prisma/seed.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@onixgroup.ae' },
    update: {},
    create: {
      email: 'admin@onixgroup.ae',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });
  
  // Create tender engineer
  const engineerPassword = await bcrypt.hash('engineer@123', 10);
  const engineer = await prisma.user.upsert({
    where: { email: 'engineer@onixgroup.ae' },
    update: {},
    create: {
      email: 'engineer@onixgroup.ae',
      password: engineerPassword,
      firstName: 'Tender',
      lastName: 'Engineer',
      role: 'TENDER_ENGINEER',
    },
  });
  
  console.log('Seeded:', { admin, engineer });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run seed:
```bash
npx prisma db seed
```

---

## 🔧 Frontend Integration

### Update Frontend API URLs

Create `.env` in frontend root:
```env
REACT_APP_API_URL=http://localhost:3001/api
```

### Update API Client

The existing `src/utils/apiClient.js` should work, but ensure it includes authentication:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export const apiClient = {
  async get(url) {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    // ... rest of the code
  },
  // ... other methods
};
```

---

## 🧪 Testing the Backend

### 1. Start the Backend
```bash
cd backend
npm run dev
```

### 2. Test Authentication
```bash
# Login as Admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@onixgroup.ae","password":"admin123","role":"ADMIN"}'
```

### 3. Test Tender Assignment
```bash
# Get token from login response, then:
curl -X POST http://localhost:3001/api/tenders/assign \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"tenderId":"tender-id","engineerId":"engineer-id"}'
```

---

## 📦 Production Deployment

### Environment Variables
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production database
- Set up email service (SendGrid, AWS SES)
- Configure file storage (AWS S3, Azure Blob)

### Build & Deploy
```bash
npm run build
npm start
```

### Docker (Optional)
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

---

## 🎯 Next Steps

1. **Implement remaining controllers**: Clients, Documents, Projects
2. **Add file upload middleware**: Multer configuration
3. **Set up Socket.io**: Real-time updates
4. **Add validation**: Express-validator for request validation
5. **Add logging**: Winston or Pino
6. **Add testing**: Jest + Supertest
7. **Add API documentation**: Swagger/OpenAPI

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [JWT Best Practices](https://jwt.io/introduction)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Need help with a specific part? Let me know!**

