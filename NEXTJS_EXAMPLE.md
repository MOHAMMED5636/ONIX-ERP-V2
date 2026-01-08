# Next.js Migration Example

## 📁 File Structure Comparison

### Current (Create React App)
```
src/
  App.js                    → All routes defined here
  components/
    companies/
      CreateCompanyPage.js
  pages/
    Clients.js
```

### Next.js Structure
```
pages/
  _app.tsx                  → App wrapper (like App.js)
  _document.tsx             → HTML document customization
  companies/
    index.tsx               → /companies
    create.tsx              → /companies/create
    [id].tsx                → /companies/:id
  clients.tsx               → /clients
components/
  companies/
    CreateCompanyForm.tsx   → Reusable component
```

---

## 🔄 Route Migration Example

### Current Route (React Router)

**App.js:**
```javascript
import CreateCompanyPage from "./components/companies/CreateCompanyPage";

<Route path="/companies/create" element={<CreateCompanyPage />} />
```

### Next.js Route

**pages/companies/create.tsx:**
```typescript
import { GetServerSideProps } from 'next';
import CreateCompanyPage from '@/components/companies/CreateCompanyPage';
import { Company } from '@/types/company';

interface CreateCompanyProps {
  initialData?: Company;
}

export default function CreateCompany({ initialData }: CreateCompanyProps) {
  return <CreateCompanyPage initialData={initialData} />;
}

// Optional: Server-side data fetching
export const getServerSideProps: GetServerSideProps = async (context) => {
  // Check authentication
  const isAuthenticated = context.req.cookies.isAuthenticated === 'true';
  
  if (!isAuthenticated) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // Fetch initial data if editing
  const companyId = context.query.id;
  if (companyId) {
    const company = await fetchCompany(companyId);
    return {
      props: {
        initialData: company,
      },
    };
  }

  return {
    props: {},
  };
};
```

---

## 🔐 Authentication Example

### Current (Client-side)

**App.js:**
```javascript
function PrivateRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
}
```

### Next.js (Server-side)

**middleware.ts:**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get('isAuthenticated')?.value === 'true';
  
  if (!isAuthenticated && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 📡 API Routes Example

### Current (External API)

**services/clientsAPI.js:**
```javascript
export const fetchClients = async () => {
  const response = await fetch('http://localhost:3001/api/clients');
  return response.json();
};
```

### Next.js (Built-in API)

**pages/api/clients/index.ts:**
```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '@/types/client';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Client[] | { error: string }>
) {
  if (req.method === 'GET') {
    try {
      const clients = await fetchClientsFromDB();
      res.status(200).json(clients);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch clients' });
    }
  } else if (req.method === 'POST') {
    try {
      const newClient = await createClient(req.body);
      res.status(201).json(newClient);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create client' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
```

**Usage in Component:**
```typescript
const clients = await fetch('/api/clients').then(res => res.json());
```

---

## 🔌 Socket.io Integration

### Current (CRA)

**hooks/useSocket.js:**
```javascript
import { useEffect } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
  useEffect(() => {
    const socket = io('http://localhost:3001');
    return () => socket.disconnect();
  }, []);
};
```

### Next.js (Custom Server or API Route)

**Option 1: Custom Server**
```javascript
// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(server);
  
  io.on('connection', (socket) => {
    console.log('Client connected');
  });

  server.listen(3000, () => {
    console.log('> Ready on http://localhost:3000');
  });
});
```

**Option 2: API Route**
```typescript
// pages/api/socket.ts
import { Server as SocketServer } from 'socket.io';
import type { NextApiRequest } from 'next';

export default function handler(req: NextApiRequest, res: any) {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    const io = new SocketServer(res.socket.server);
    res.socket.server.io = io;
  }
  res.end();
}
```

---

## 🎨 Layout Example

### Current (CRA)

**App.js:**
```javascript
function MainLayout() {
  return (
    <div>
      <Sidebar />
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </div>
  );
}
```

### Next.js

**pages/_app.tsx:**
```typescript
import type { AppProps } from 'next/app';
import { CompanySelectionProvider } from '@/context/CompanySelectionContext';
import MainLayout from '@/components/layout/MainLayout';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CompanySelectionProvider>
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    </CompanySelectionProvider>
  );
}
```

**components/layout/MainLayout.tsx:**
```typescript
import { useRouter } from 'next/router';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hideNavbar = router.pathname.startsWith('/tasks');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {!hideNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

---

## 📦 Package.json Comparison

### Current (CRA)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.30.1",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}
```

### Next.js
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

**Note:** No `react-router-dom` needed - Next.js handles routing!

---

## 🚀 Migration Steps for One Route

### Step 1: Create Next.js page
```bash
mkdir -p pages/companies
touch pages/companies/create.tsx
```

### Step 2: Copy component logic
```typescript
// pages/companies/create.tsx
import CreateCompanyPage from '@/components/companies/CreateCompanyPage';

export default function CreateCompany() {
  return <CreateCompanyPage />;
}
```

### Step 3: Update imports
- Change `react-router-dom` imports to Next.js equivalents
- Update `useNavigate` → `useRouter`
- Update `Link` → Next.js `Link`

### Step 4: Test
- Verify route works
- Check authentication
- Test form submission

---

## ⚡ Performance Benefits

### Current (CRA)
```
Initial Load: ~2-3 seconds
- Load entire JS bundle
- Parse and execute
- Render components
```

### Next.js (SSR)
```
Initial Load: ~0.5-1 second
- Server renders HTML
- Hydrate with minimal JS
- Faster Time to Interactive
```

---

## 🎯 Key Takeaways

1. **Routing:** File-based instead of Route components
2. **Navigation:** `useRouter` instead of `useNavigate`
3. **Links:** Next.js `Link` instead of React Router `Link`
4. **Data Fetching:** `getServerSideProps` for SSR
5. **API:** Built-in API routes instead of external server
6. **Authentication:** Server-side checks possible

---

## 💡 Quick Reference

| CRA | Next.js |
|-----|---------|
| `<Route>` | File-based routing |
| `useNavigate()` | `useRouter().push()` |
| `<Link to="">` | `<Link href="">` |
| `useLocation()` | `useRouter()` |
| `BrowserRouter` | Not needed |
| External API | `/pages/api/` |

---

This shows how your current setup would translate to Next.js! 🚀











