# Usage Examples for New Features

This document shows how to use the newly implemented persistent data layer and notification system.

## Database Persistence

All data is now automatically persisted to IndexedDB. You can use the existing service APIs:

### Campaign Management

```typescript
import { campaignService } from "@/services/campaignService";
import { useToast } from "@/context/ToastContext";

function ExampleComponent() {
  const toast = useToast();

  const handleCreateCampaign = async () => {
    try {
      const newCampaign = await campaignService.createCampaign({
        name: "New Campaign",
        clientId: "client-123",
        goal: 50000,
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        category: "General",
      });

      toast.success(
        "Campaign created successfully!",
        `Campaign "${newCampaign.name}" has been saved to the database.`,
      );
    } catch (error) {
      toast.error(
        "Failed to create campaign",
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    }
  };
}
```

### Client Management

```typescript
import { clientService } from "@/services/clientService";
import { useToast } from "@/context/ToastContext";

function ExampleClientComponent() {
  const toast = useToast();

  const handleCreateClient = async () => {
    try {
      const newClient = await clientService.create({
        name: "Acme Nonprofit",
        primaryContactEmail: "contact@acme.org",
        website: "https://acme.org",
      });

      toast.success("Client added successfully!");
    } catch (error) {
      toast.error("Failed to create client", error.message);
    }
  };

  const handleLoadClients = async () => {
    try {
      const clients = await clientService.getAll();
      console.log("Loaded clients:", clients);

      toast.info(`Loaded ${clients.length} clients from database`);
    } catch (error) {
      toast.error("Failed to load clients");
    }
  };
}
```

## Toast Notifications

The toast system provides user feedback for all operations:

### Basic Usage

```typescript
import { useToast } from "@/context/ToastContext";

function ExampleComponent() {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success("Operation completed!");
  };

  const handleError = () => {
    toast.error("Something went wrong", "Please try again later");
  };

  const handleWarning = () => {
    toast.warning("This action cannot be undone");
  };

  const handleInfo = () => {
    toast.info("Database connected successfully");
  };
}
```

### Advanced Usage

```typescript
import { useToast } from "@/context/ToastContext";

function ExampleComponent() {
  const toast = useToast();

  const handleAdvancedToast = () => {
    const id = toast.success(
      "Data saved!",
      "Your changes have been persisted",
      {
        duration: 10000, // 10 seconds
        action: {
          label: "View Details",
          onClick: () => {
            console.log("Action clicked!");
          },
        },
      },
    );

    // Remove toast programmatically
    setTimeout(() => {
      toast.removeToast(id);
    }, 5000);
  };
}
```

## Form Validation

Use the validation utilities for form input validation:

```typescript
import { validateCampaign } from "@/utils/validation";
import { useToast } from "@/context/ToastContext";

function CampaignForm() {
  const toast = useToast();

  const handleSubmit = (formData: any) => {
    const validation = validateCampaign(formData);

    if (!validation.success) {
      // Show first validation error
      const firstError = Object.values(validation.errors)[0];
      toast.error("Validation Error", firstError);
      return;
    }

    // Data is valid, proceed with creation
    const validData = validation.data;
    // ... create campaign
  };
}
```

## Error Handling

Error boundaries automatically catch React errors and display a user-friendly interface:

```typescript
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <YourComponents />
    </ErrorBoundary>
  );
}
```

## Database Management

Access raw database operations if needed:

```typescript
import { indexedDbService, STORES } from "@/services/database";

// Export all data
const exportData = async () => {
  const data = await indexedDbService.exportData();
  console.log("All data:", data);
};

// Import data
const importData = async (data: any) => {
  await indexedDbService.importData(data);
  toast.success("Data imported successfully");
};

// Get database info
const getDbInfo = async () => {
  const info = await indexedDbService.getInfo();
  console.log("Database info:", info);
};
```

## Migration from Mock Data

The new system automatically seeds the database with existing mock data on first load. No manual migration is required - your app will work exactly the same but now with real persistence!

## Next Steps

1. **Authentication Integration**: When you add real authentication, simply update the `createdBy` field in campaigns to use actual user data.

2. **Backend Integration**: Replace the IndexedDB services with API calls by updating the service implementations. The component interfaces remain the same.

3. **Data Sync**: Add offline sync capabilities by combining IndexedDB for local storage with API calls for server sync.

4. **Advanced Validation**: Extend the validation schemas as your forms become more complex.

5. **Error Reporting**: Integrate error tracking (like Sentry) by using the error boundary's `onError` callback.
