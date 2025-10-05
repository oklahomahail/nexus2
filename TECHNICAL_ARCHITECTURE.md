# Technical Architecture - Nexus Platform

**Version:** 0.2.3  
**Last Updated:** December 2025  
**Architecture Type:** Modern React SPA with Client-Side Data Persistence

## 🏗️ System Overview

Nexus is architected as a sophisticated single-page application (SPA) built with modern web technologies, emphasizing type safety, performance, and maintainability. The platform follows a component-based architecture with clear separation of concerns between presentation, business logic, and data management.

## 🎯 Architecture Principles

### 1. **Type-First Development**

- **100% TypeScript coverage** across all modules
- **Strict type checking** with comprehensive interface definitions
- **Runtime validation** using Zod schemas
- **Compile-time error detection** for enhanced developer experience

### 2. **Component-Driven Design**

- **Atomic design principles** with reusable component library
- **Separation of concerns** between UI and business logic
- **Custom hooks** for stateful logic encapsulation
- **Barrel exports** for clean import paths

### 3. **Performance-First**

- **Code splitting** with dynamic imports
- **Tree shaking** for minimal bundle size
- **Memoization** for expensive computations
- **Lazy loading** for non-critical components

### 4. **Data Integrity**

- **Client-side persistence** with IndexedDB
- **Data validation** at service boundaries
- **Error boundaries** for graceful failure handling
- **Optimistic updates** with rollback capabilities

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  React Components (45+) │ Custom Hooks │ Context Providers  │
│                         │              │                    │
│  • Analytics Dashboards │ • useForm    │ • ClientContext    │
│  • Campaign Builders    │ • useToast   │ • AuthContext      │
│  • Donor Management     │ • useDebounce│ • ThemeContext     │
│  • Communication Tools  │              │                    │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│                     Service Layer (15+)                     │
│                                                             │
│  PersonalizationService  │  SegmentationEngine              │
│  CrossChannelAnalytics   │  PredictiveAnalytics             │
│  EmailCampaignService    │  DirectMailService               │
│  SocialMediaService      │  BackupService                   │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
├─────────────────────────────────────────────────────────────┤
│  IndexedDB Storage │ Type Models │ Validation Schemas       │
│                    │             │                          │
│  • Client-side DB  │ • Donor     │ • Zod Schemas            │
│  • Offline support │ • Campaign  │ • Runtime Validation     │
│  • Data persistence│ • Analytics │ • Type Inference         │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Module Architecture

### Core Modules

#### 1. **Components Layer** (`src/components/`)

```typescript
components/
├── ui/                       # Professional UI component system
│   ├── Button.tsx            # Button hierarchy (primary/secondary/ghost) × 3 sizes
│   ├── Input.tsx             # Quiet inputs with proper focus states
│   ├── Badge.tsx             # Status indicators with color coding
│   ├── Table.tsx             # Professional table components
│   ├── SearchInput.tsx       # Search with clear functionality
│   ├── Toast.tsx             # Feedback notification system
│   └── index.ts              # Barrel exports for clean imports
├── analytics/                 # Analytics and reporting components
│   ├── CrossChannelAnalyticsDashboard.tsx
│   ├── SegmentPerformanceDashboard.tsx
│   ├── EnhancedAnalyticsWidgets.tsx
│   └── PerformanceChart.tsx
├── campaigns/                 # Campaign management components
│   ├── CampaignCreationWizard.tsx
│   ├── EmailCampaignBuilder.tsx
│   ├── ChannelPlanningWizard.tsx
│   └── LiveCampaignProgress.tsx
├── segmentation/             # Donor segmentation components
│   ├── SegmentPerformanceDashboard.tsx
│   ├── SegmentComparison.tsx
│   └── DonorInsightsPanel.tsx
├── communication/            # Multi-channel communication
│   ├── CommunicationTools.tsx
│   ├── SocialMediaManager.tsx
│   └── ChannelTemplatesLibrary.tsx
├── ClientWizard.tsx          # 3-step guided client creation flow
└── common/                   # Legacy reusable components
    ├── LoadingSpinner.tsx
    ├── ErrorBoundary.tsx
    ├── FormComponents.tsx
    └── IconBadge.tsx
```

#### 2. **Services Layer** (`src/services/`)

```typescript
services/
├── personalizationService.ts      # Content personalization engine
├── segmentationEngine.ts          # Donor clustering algorithms
├── crossChannelAnalyticsService.ts # Multi-channel analytics
├── predictiveAnalyticsService.ts  # ML-powered predictions
├── emailCampaignService.ts        # Email automation
├── directMailService.ts           # Print campaign management
├── socialMediaService.ts          # Social media integration
├── backupService.ts               # Data backup and recovery
├── analyticsService.ts            # Core analytics engine
└── apiService.ts                  # HTTP client wrapper
```

#### 3. **Data Models** (`src/models/`)

```typescript
models/
├── donor.ts          # Donor-related interfaces
├── campaign.ts       # Campaign and channel types
├── analytics.ts      # Analytics and reporting models
├── channels.ts       # Communication channel types
├── segmentation.ts   # Segmentation and clustering models
└── common.ts         # Shared type definitions
```

#### 4. **Custom Hooks** (`src/hooks/`)

```typescript
hooks/
├── useForm.ts        # Form state management
├── useToast.ts       # Notification system
├── useDebounce.ts    # Input debouncing
├── useLocalStorage.ts # Local storage wrapper
└── useAnalytics.ts   # Analytics integration
```

#### 5. **Context Providers** (`src/context/`)

```typescript
context/
├── ClientContext.tsx    # Multi-client state management
├── AuthContext.tsx      # Authentication state
├── ThemeContext.tsx     # Theme and UI preferences
└── NotificationContext.tsx # Global notifications
```

## 🔧 Service Architecture

### PersonalizationService

```typescript
class PersonalizationService {
  // Core personalization methods
  personalizeContent(donor: Donor, template: Template): PersonalizedContent;
  getDonorJourneyStage(donor: Donor): Promise<JourneyStage>;
  generatePersonalizedRecommendations(donor: Donor): Recommendation[];

  // Advanced personalization
  predictOptimalContactTime(donor: Donor): Date;
  generateDynamicContent(donor: Donor, context: Context): Content;
  calculatePersonalizationScore(content: Content, donor: Donor): number;
}
```

### SegmentationEngine

```typescript
class SegmentationEngine {
  // Segmentation algorithms
  createDynamicSegments(donors: Donor[]): Segment[];
  calculateSegmentPerformance(segment: Segment): PerformanceMetrics;
  identifyHighValueSegments(segments: Segment[]): Segment[];

  // ML-powered clustering
  applyKMeansClustering(donors: Donor[], k: number): Cluster[];
  calculateEngagementScore(donor: Donor): number;
  predictChurnRisk(donor: Donor): ChurnPrediction;
}
```

### CrossChannelAnalyticsService

```typescript
class CrossChannelAnalyticsService {
  // Multi-channel analytics
  getCrossChannelAnalytics(campaignId: string): Promise<Analytics>;
  calculateAttributionModel(touches: Touch[]): Attribution;
  generateCampaignReport(campaignId: string): Promise<Report>;

  // Performance tracking
  trackChannelPerformance(channel: Channel): PerformanceData;
  syncChannelData(campaignId: string): Promise<void>;
  calculateROI(campaign: Campaign): ROIMetrics;
}
```

## 💾 Data Flow Architecture

### 1. **Component → Service → Data**

```typescript
// Component triggers action
const handleSegmentAnalysis = async () => {
  setLoading(true);
  try {
    // Service layer processes business logic
    const segments = await segmentationEngine.createDynamicSegments(donors);
    const performance = await segmentationEngine.calculateSegmentPerformance(
      segments[0],
    );

    // Update component state
    setSegments(segments);
    setPerformance(performance);
  } catch (error) {
    // Error boundary handles failures
    handleError(error);
  } finally {
    setLoading(false);
  }
};
```

### 2. **IndexedDB Integration**

```typescript
// Data persistence layer
class DataStore {
  private db: IDBDatabase;

  async saveData<T>(store: string, data: T): Promise<void> {
    const transaction = this.db.transaction([store], "readwrite");
    const objectStore = transaction.objectStore(store);
    await objectStore.put(data);
  }

  async getData<T>(store: string, key: string): Promise<T | null> {
    const transaction = this.db.transaction([store], "readonly");
    const objectStore = transaction.objectStore(store);
    return await objectStore.get(key);
  }
}
```

### 3. **Type-Safe API Layer**

```typescript
// HTTP client with type safety
class ApiClient {
  async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...this.defaultOptions,
      ...options,
    });

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText);
    }

    return response.json() as Promise<ApiResponse<T>>;
  }
}
```

## 🎨 Component Patterns

### 1. **Container/Presenter Pattern**

```typescript
// Container component handles logic
const DashboardContainer: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalyticsData().then(setData).finally(() => setLoading(false))
  }, [])

  return <DashboardPresenter data={data} loading={loading} />
}

// Presenter component handles UI
const DashboardPresenter: React.FC<Props> = ({ data, loading }) => {
  if (loading) return <LoadingSpinner />
  if (!data) return <ErrorMessage />
  return <AnalyticsDashboard data={data} />
}
```

### 2. **Custom Hook Pattern**

```typescript
// Encapsulate stateful logic in custom hooks
export const useSegmentAnalytics = (segmentId: string) => {
  const [analytics, setAnalytics] = useState<SegmentAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const data = await segmentationEngine.getSegmentAnalytics(segmentId);
        setAnalytics(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [segmentId]);

  return { analytics, loading, error };
};
```

### 3. **Compound Component Pattern**

```typescript
// Flexible, composable components
export const CampaignBuilder = {
  Root: CampaignBuilderRoot,
  Steps: CampaignBuilderSteps,
  Step: CampaignBuilderStep,
  Content: CampaignBuilderContent,
  Actions: CampaignBuilderActions,
}

// Usage
<CampaignBuilder.Root>
  <CampaignBuilder.Steps>
    <CampaignBuilder.Step title="Setup">
      <CampaignBuilder.Content>
        <SetupForm />
      </CampaignBuilder.Content>
    </CampaignBuilder.Step>
  </CampaignBuilder.Steps>
  <CampaignBuilder.Actions>
    <Button>Next</Button>
  </CampaignBuilder.Actions>
</CampaignBuilder.Root>
```

## 🔄 State Management

### 1. **Context-Based Global State**

```typescript
// Client context for multi-tenant support
const ClientContext = createContext<ClientContextValue | null>(null)

export const ClientProvider: React.FC<Props> = ({ children }) => {
  const [currentClient, setCurrentClient] = useState<Client | null>(null)
  const [clients, setClients] = useState<Client[]>([])

  const switchClient = useCallback((client: Client) => {
    setCurrentClient(client)
    // Trigger data refresh for new client
    refreshClientData(client.id)
  }, [])

  return (
    <ClientContext.Provider value={{ currentClient, clients, switchClient }}>
      {children}
    </ClientContext.Provider>
  )
}
```

### 2. **Component-Level State**

```typescript
// Local state with TypeScript
const [campaignData, setCampaignData] = useState<CreateCampaignData>({
  name: "",
  type: "annual_fund",
  goal: 0,
  startDate: new Date(),
  endDate: new Date(),
  description: "",
});

// State updates with type safety
const updateCampaignField = <K extends keyof CreateCampaignData>(
  field: K,
  value: CreateCampaignData[K],
) => {
  setCampaignData((prev) => ({ ...prev, [field]: value }));
};
```

## 🛡️ Error Handling Strategy

### 1. **Error Boundaries**

```typescript
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo)
    // Log to error reporting service
    errorReportingService.reportError(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }

    return this.props.children
  }
}
```

### 2. **Service-Level Error Handling**

```typescript
class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

// Service method with proper error handling
async createCampaign(data: CreateCampaignData): Promise<Campaign> {
  try {
    validateCampaignData(data)
    const campaign = await this.apiClient.post('/campaigns', data)
    return campaign
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new ServiceError('Invalid campaign data', 'VALIDATION_ERROR', { data })
    }
    throw new ServiceError('Failed to create campaign', 'CREATE_FAILED', { error })
  }
}
```

## 📊 Performance Optimization

### 1. **Code Splitting**

```typescript
// Lazy loading for large components
const CrossChannelAnalyticsDashboard = lazy(
  () => import('./components/CrossChannelAnalyticsDashboard')
)

// Route-based code splitting
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))

// Component with Suspense boundary
<Suspense fallback={<LoadingSpinner />}>
  <CrossChannelAnalyticsDashboard campaignId={campaignId} />
</Suspense>
```

### 2. **Memoization**

```typescript
// Expensive calculations with useMemo
const segmentPerformanceMetrics = useMemo(() => {
  return calculateComplexMetrics(segments, donations, timeRange)
}, [segments, donations, timeRange])

// Callback memoization
const handleSegmentUpdate = useCallback((segmentId: string, updates: Partial<Segment>) => {
  updateSegment(segmentId, updates)
}, [updateSegment])

// Component memoization
const ExpensiveComponent = memo<Props>(({ data, config }) => {
  return <ComplexVisualization data={data} config={config} />
})
```

### 3. **Bundle Optimization**

```typescript
// Vite configuration for optimal bundling
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": ["lucide-react", "recharts"],
          "utils-vendor": ["crypto-js", "uuid", "zod"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});
```

## 🔐 Security Architecture

### 1. **Data Encryption**

```typescript
// Client-side data encryption
class EncryptionService {
  private readonly secretKey = process.env.VITE_ENCRYPTION_KEY!;

  encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, this.secretKey).toString();
  }

  decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
```

### 2. **Input Validation**

```typescript
// Zod schemas for runtime validation
const CreateCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["annual_fund", "capital", "emergency"]),
  goal: z.number().positive(),
  startDate: z.date(),
  endDate: z.date(),
  description: z.string().optional(),
});

// Type-safe validation
function validateCampaignData(data: unknown): CreateCampaignData {
  return CreateCampaignSchema.parse(data);
}
```

## 🧪 Testing Strategy

### 1. **Component Testing**

```typescript
// Vitest + Testing Library
describe('IconBadge Component', () => {
  it('renders with correct styling', () => {
    render(<IconBadge variant="success" size="sm" />)
    const badge = screen.getByRole('presentation')
    expect(badge).toHaveClass('bg-green-100', 'text-green-800', 'text-xs')
  })

  it('handles icon prop correctly', () => {
    const MockIcon = () => <div data-testid="mock-icon" />
    render(<IconBadge icon={MockIcon} />)
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument()
  })
})
```

### 2. **Service Testing**

```typescript
// Service layer testing
describe("SegmentationEngine", () => {
  let engine: SegmentationEngine;

  beforeEach(() => {
    engine = new SegmentationEngine();
  });

  it("creates dynamic segments correctly", () => {
    const donors = generateMockDonors(100);
    const segments = engine.createDynamicSegments(donors);

    expect(segments).toHaveLength(5); // Expected number of segments
    expect(segments[0].criteria).toBeDefined();
    expect(segments[0].donorIds).toBeInstanceOf(Array);
  });
});
```

## 🚀 Build & Deployment Pipeline

### 1. **Build Process**

```bash
# Development build
pnpm dev          # Start dev server with HMR
pnpm typecheck    # TypeScript compilation check
pnpm lint         # ESLint with max 4 warnings
pnpm test         # Run test suite

# Production build
pnpm build        # Optimized production build
pnpm preview      # Preview production build locally
```

### 2. **CI/CD Pipeline**

```yaml
# GitHub Actions workflow
name: Build and Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "pnpm"

      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build

      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 📈 Monitoring & Analytics

### 1. **Performance Monitoring**

```typescript
// Performance tracking
class PerformanceMonitor {
  static startTiming(label: string): void {
    performance.mark(`${label}-start`);
  }

  static endTiming(label: string): number {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);

    const measure = performance.getEntriesByName(label)[0];
    return measure.duration;
  }

  static reportMetrics(): void {
    const metrics = performance.getEntriesByType("measure");
    // Send to analytics service
    analyticsService.reportPerformanceMetrics(metrics);
  }
}
```

### 2. **Error Reporting**

```typescript
// Centralized error reporting
class ErrorReportingService {
  reportError(error: Error, context?: Record<string, unknown>): void {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      context,
    };

    // Send to error tracking service
    this.sendErrorReport(errorReport);
  }

  private async sendErrorReport(report: ErrorReport): Promise<void> {
    // Implementation for error reporting service
  }
}
```

## 🔮 Future Architecture Considerations

### 1. **Server-Side Rendering (SSR)**

- Next.js migration for improved SEO and initial load performance
- Static site generation for public pages
- Edge computing for global performance optimization

### 2. **Micro-Frontend Architecture**

- Module federation for independent team development
- Shared component library across multiple applications
- Plugin architecture for third-party integrations

### 3. **Real-Time Features**

- WebSocket integration for live collaboration
- Server-sent events for real-time notifications
- Offline-first architecture with sync capabilities

### 4. **Advanced Analytics**

- Client-side machine learning with TensorFlow.js
- Advanced data visualization with D3.js integration
- Predictive modeling for donor behavior analysis

---

This technical architecture documentation provides a comprehensive overview of the current system design and implementation patterns used throughout the Nexus platform. The architecture prioritizes type safety, performance, maintainability, and scalability while providing a solid foundation for future enhancements and features.
