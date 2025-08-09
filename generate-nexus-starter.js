const fs = require("fs");
const path = require("path");

const files = {
  "package.json": `{
  "name": "nexus",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "typescript": "^5.1.3",
    "vite": "^4.4.9",
    "tailwindcss": "^3.3.2",
    "postcss": "^8.4.26",
    "autoprefixer": "^10.4.14"
  }
}
`,
  "vite.config.ts": `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`,
  "tailwind.config.js": `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
`,
  "tsconfig.json": `{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
`,
  "README.md": `# Nexus

Nexus is an internal nonprofit consulting platform for donor management, campaigns, events, and analytics.

## Setup

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:5173 to view in the browser.

## Project Structure

- \`src/components\` - UI components
- \`src/services\` - API and business logic
- \`src/models\` - Domain interfaces
- \`src/context\` - Global state and contexts
- \`src/utils\` - Utility functions

## Next Steps

- Expand donor and campaign features
- Integrate AI content & analytics
- Add authentication and permissions
`,
  "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nexus</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
`,
  "src/index.css": `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50 text-gray-900 font-sans;
}
`,
  "src/main.tsx": `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`,
  "src/App.tsx": `import React, { useEffect, useState } from 'react';
import { DashboardPanel } from './components/DashboardPanel';
import { Donor } from './models/donor';
import { fetchDonors } from './services/donorService';

function App() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDonors()
      .then(setDonors)
      .catch(err => setError(err.message));
  }, []);

  const totalRevenue = donors.reduce((sum, d) => sum + d.totalGiven, 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Nexus</h1>
      {error && <p className="text-red-600 mb-4">Error loading donors: {error}</p>}
      <DashboardPanel totalDonors={donors.length} totalRevenue={totalRevenue} activeCampaigns={3} />
    </div>
  );
}

export default App;
`,
  "src/components/DashboardPanel.tsx": `import React from 'react';

interface DashboardPanelProps {
  totalDonors: number;
  totalRevenue: number;
  activeCampaigns: number;
}

export const DashboardPanel: React.FC<DashboardPanelProps> = ({
  totalDonors,
  totalRevenue,
  activeCampaigns,
}) => {
  return (
    <section className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Nexus Dashboard</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="text-lg font-medium">Total Donors</h3>
          <p className="text-3xl font-bold">{totalDonors}</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <h3 className="text-lg font-medium">Total Revenue</h3>
          <p className="text-3xl font-bold">\${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded">
          <h3 className="text-lg font-medium">Active Campaigns</h3>
          <p className="text-3xl font-bold">{activeCampaigns}</p>
        </div>
      </div>
    </section>
  );
};
`,
  "src/models/donor.ts": `export interface Donor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalGiven: number;
  lastGiftDate?: Date;
  notes?: string;
}
`,
  "src/services/apiClient.ts": `const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(\`\${API_BASE}/\${endpoint}\`);
    if (!res.ok) throw new Error(\`API error: \${res.statusText}\`);
    const data = (await res.json()) as T;
    return { data };
  } catch (error: any) {
    return { data: null as any, error: error.message };
  }
}
`,
  "src/services/donorService.ts": `import { Donor } from '../models/donor';
import { apiGet } from './apiClient';

export async function fetchDonors(): Promise<Donor[]> {
  const response = await apiGet<Donor[]>('donors');
  if (response.error) {
    throw new Error(response.error);
  }
  return response.data;
}
`,
};

function writeFiles(basePath, files) {
  for (const [filename, content] of Object.entries(files)) {
    const filePath = path.join(basePath, filename);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content);
    console.log(`Created ${filePath}`);
  }
}

writeFiles(process.cwd(), files);
console.log("Nexus starter scaffold created!");
