import {
  Layout,
  Type,
  Image as ImageIcon,
  BarChart3,
  TrendingUp,
  Table as TableIcon,
  FileText,
  Palette,
  Copy,
  Trash2,
  Eye,
  Download,
  Save,
  Undo,
  Redo,
  Monitor,
  Smartphone,
  Tablet,
  Grid,
} from "lucide-react";
import React, { useState, useMemo, useCallback, useRef } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Report Component Types
interface ReportComponent {
  id: string;
  type: "text" | "chart" | "metric" | "table" | "image" | "spacer";
  x: number;
  y: number;
  width: number;
  height: number;
  config: ComponentConfig;
}

interface ComponentConfig {
  content?: string;
  fontSize?: number;
  fontWeight?: "normal" | "bold";
  textAlign?: "left" | "center" | "right";
  color?: string;
  chartType?: "line" | "bar" | "area" | "pie";
  dataSource?: string;
  title?: string;
  label?: string;
  value?: string | number;
  trend?: number;
  format?: "currency" | "percentage" | "number";
  src?: string;
  alt?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  padding?: number;
  margin?: number;
}

// Brand Configuration
interface BrandConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;
  organizationName: string;
  font: string;
  reportHeader: string;
  reportFooter: string;
}

// Component Library Items
const COMPONENT_LIBRARY = [
  {
    id: "header-text",
    type: "text" as const,
    name: "Header",
    icon: Type,
    defaultConfig: {
      content: "Report Title",
      fontSize: 24,
      fontWeight: "bold" as const,
      textAlign: "center" as const,
      color: "#1e293b",
    },
  },
  {
    id: "body-text",
    type: "text" as const,
    name: "Text Block",
    icon: FileText,
    defaultConfig: {
      content: "Add your content here...",
      fontSize: 14,
      fontWeight: "normal" as const,
      textAlign: "left" as const,
      color: "#475569",
    },
  },
  {
    id: "metric-card",
    type: "metric" as const,
    name: "Metric Card",
    icon: TrendingUp,
    defaultConfig: {
      label: "Total Raised",
      value: "$125,000",
      trend: 12.5,
      format: "currency" as const,
      backgroundColor: "#f8fafc",
      borderRadius: 8,
      padding: 16,
    },
  },
  {
    id: "line-chart",
    type: "chart" as const,
    name: "Line Chart",
    icon: TrendingUp,
    defaultConfig: {
      chartType: "line" as const,
      title: "Performance Over Time",
      dataSource: "campaign_timeline",
    },
  },
  {
    id: "bar-chart",
    type: "chart" as const,
    name: "Bar Chart",
    icon: BarChart3,
    defaultConfig: {
      chartType: "bar" as const,
      title: "Campaign Comparison",
      dataSource: "campaign_performance",
    },
  },
  {
    id: "data-table",
    type: "table" as const,
    name: "Data Table",
    icon: TableIcon,
    defaultConfig: {
      title: "Campaign Details",
      dataSource: "campaign_list",
    },
  },
  {
    id: "logo-image",
    type: "image" as const,
    name: "Logo/Image",
    icon: ImageIcon,
    defaultConfig: {
      src: "",
      alt: "Organization Logo",
      borderRadius: 4,
    },
  },
  {
    id: "spacer",
    type: "spacer" as const,
    name: "Spacer",
    icon: Grid,
    defaultConfig: {
      backgroundColor: "transparent",
    },
  },
];

// Mock data for charts
const MOCK_DATA = {
  campaign_timeline: [
    { month: "Jan", raised: 45000, goal: 50000 },
    { month: "Feb", raised: 52000, goal: 55000 },
    { month: "Mar", raised: 61000, goal: 60000 },
    { month: "Apr", raised: 58000, goal: 65000 },
    { month: "May", raised: 67000, goal: 70000 },
    { month: "Jun", raised: 73000, goal: 75000 },
  ],
  campaign_performance: [
    { name: "Annual Fund", raised: 125000, goal: 150000 },
    { name: "Capital Campaign", raised: 275000, goal: 500000 },
    { name: "Emergency Fund", raised: 82500, goal: 75000 },
    { name: "Program Fund", raised: 28000, goal: 45000 },
  ],
};

const CustomReportBuilder: React.FC = () => {
  const [components, setComponents] = useState<ReportComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"design" | "brand" | "preview">(
    "design",
  );
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">(
    "desktop",
  );
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [history, setHistory] = useState<ReportComponent[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Brand configuration
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
    primaryColor: "#3B82F6",
    secondaryColor: "#059669",
    accentColor: "#DC2626",
    logo: "",
    organizationName: "Your Organization",
    font: "Inter",
    reportHeader: "Campaign Performance Report",
    reportFooter: "Confidential - For Internal Use Only",
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Generate unique ID
  const generateId = () =>
    `component_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  // History management
  const addToHistory = useCallback(
    (newComponents: ReportComponent[]) => {
      setHistory((prev) => {
        const capped = prev.slice(0, historyIndex + 1);
        const next = [...capped, [...newComponents]];
        return next.slice(-50);
      });
      setHistoryIndex((i) => i + 1);
    },
    [historyIndex],
  );

  const undo = useCallback(() => {
    setHistoryIndex((i) => {
      if (i > 0) {
        const nextIndex = i - 1;
        setComponents(history[nextIndex]);
        return nextIndex;
      }
      return i;
    });
  }, [history]);

  const redo = useCallback(() => {
    setHistoryIndex((i) => {
      if (i < history.length - 1) {
        const nextIndex = i + 1;
        setComponents(history[nextIndex]);
        return nextIndex;
      }
      return i;
    });
  }, [history]);

  // Add component to canvas
  const addComponent = useCallback(
    (libraryItem: any, position?: { x: number; y: number }) => {
      const newComponent: ReportComponent = {
        id: generateId(),
        type: libraryItem.type,
        x: position?.x ?? 50,
        y: position?.y ?? 50,
        width:
          libraryItem.type === "chart"
            ? 400
            : libraryItem.type === "metric"
              ? 200
              : 300,
        height:
          libraryItem.type === "chart"
            ? 300
            : libraryItem.type === "metric"
              ? 120
              : libraryItem.type === "text"
                ? 40
                : 200,
        config: { ...libraryItem.defaultConfig },
      };

      setComponents((prev) => {
        const updated = [...prev, newComponent];
        addToHistory(updated);
        return updated;
      });
      setSelectedComponent(newComponent.id);
    },
    [addToHistory],
  );

  // Component operations
  const updateComponent = useCallback(
    (id: string, updates: Partial<ReportComponent>) => {
      setComponents((prev) => {
        const updated = prev.map((comp) =>
          comp.id === id ? { ...comp, ...updates } : comp,
        );
        addToHistory(updated);
        return updated;
      });
    },
    [addToHistory],
  );

  const deleteComponent = useCallback(
    (id: string) => {
      setComponents((prev) => {
        const updated = prev.filter((comp) => comp.id !== id);
        addToHistory(updated);
        return updated;
      });
      setSelectedComponent(null);
    },
    [addToHistory],
  );

  const duplicateComponent = useCallback(
    (id: string) => {
      setComponents((prev) => {
        const component = prev.find((c) => c.id === id);
        if (!component) return prev;
        const duplicate: ReportComponent = {
          ...component,
          id: generateId(),
          x: component.x + 20,
          y: component.y + 20,
        };
        const updated = [...prev, duplicate];
        addToHistory(updated);
        return updated;
      });
    },
    [addToHistory],
  );

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const itemData = e.dataTransfer.getData("application/json");
    if (itemData && canvasRef.current) {
      const libraryItem = JSON.parse(itemData);
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addComponent(libraryItem, { x, y });
    }
    setIsDragging(false);
    setDraggedItem(null);
  };

  // Canvas dimensions based on view mode
  const canvasDimensions = useMemo(() => {
    switch (viewMode) {
      case "mobile":
        return { width: 375, height: 667 };
      case "tablet":
        return { width: 768, height: 1024 };
      default:
        return { width: 1200, height: 800 };
    }
  }, [viewMode]);

  // Render chart component
  const renderChart = (component: ReportComponent) => {
    const data =
      MOCK_DATA[component.config.dataSource as keyof typeof MOCK_DATA] || [];

    switch (component.config.chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data as any[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: any) => `$${Number(value).toLocaleString()}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="raised"
                stroke={brandConfig.primaryColor}
                strokeWidth={2}
                name="Raised"
              />
              <Line
                type="monotone"
                dataKey="goal"
                stroke={brandConfig.secondaryColor}
                strokeDasharray="5 5"
                name="Goal"
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data as any[]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: any) => `$${Number(value).toLocaleString()}`}
              />
              <Legend />
              <Bar
                dataKey="raised"
                fill={brandConfig.primaryColor}
                name="Raised"
              />
              <Bar
                dataKey="goal"
                fill={brandConfig.secondaryColor}
                name="Goal"
              />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full text-slate-400">
            Chart Preview
          </div>
        );
    }
  };

  // Render component on canvas
  const renderComponent = (component: ReportComponent) => {
    const isSelected = selectedComponent === component.id;
    const baseClasses = `absolute border-2 transition-all ${
      isSelected
        ? "border-blue-500 shadow-lg"
        : "border-transparent hover:border-blue-300"
    }`;

    const style: React.CSSProperties = {
      left: component.x,
      top: component.y,
      width: component.width,
      height: component.height,
      backgroundColor: component.config.backgroundColor,
      borderColor: component.config.borderColor,
      borderRadius: component.config.borderRadius,
      padding: component.config.padding,
      margin: component.config.margin,
      color: component.config.color,
      fontSize: component.config.fontSize,
      fontWeight: component.config.fontWeight,
      textAlign: component.config.textAlign,
      position: "absolute",
    };

    let content: React.ReactNode;
    switch (component.type) {
      case "text":
        content = (
          <div
            className="h-full flex items-center"
            style={{
              fontSize: component.config.fontSize,
              fontWeight: component.config.fontWeight,
              textAlign: component.config.textAlign,
              color: component.config.color,
            }}
          >
            {component.config.content}
          </div>
        );
        break;
      case "metric":
        content = (
          <div className="p-4 h-full">
            <div className="text-sm text-slate-600 mb-1">
              {component.config.label}
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {component.config.value}
            </div>
            {typeof component.config.trend === "number" && (
              <div
                className={`text-sm flex items-center gap-1 ${
                  component.config.trend > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                <TrendingUp className="h-3 w-3" />
                {component.config.trend > 0 ? "+" : ""}
                {component.config.trend}%
              </div>
            )}
          </div>
        );
        break;
      case "chart":
        content = (
          <div className="p-4 h-full">
            {component.config.title && (
              <h3 className="text-lg font-semibold mb-4">
                {component.config.title}
              </h3>
            )}
            <div className="h-[calc(100%-2rem)]">{renderChart(component)}</div>
          </div>
        );
        break;
      case "image":
        content = (
          <img
            src={component.config.src || "/api/placeholder/200/150"}
            alt={component.config.alt || "Report image"}
            className="w-full h-full object-cover"
            style={{ borderRadius: component.config.borderRadius }}
          />
        );
        break;
      case "table":
        content = (
          <div className="p-4 h-full overflow-auto">
            <h3 className="text-lg font-semibold mb-4">
              {component.config.title}
            </h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Campaign</th>
                  <th className="text-right p-2">Raised</th>
                  <th className="text-right p-2">Goal</th>
                  <th className="text-right p-2">Progress</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_DATA.campaign_performance.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{item.name}</td>
                    <td className="text-right p-2">
                      ${item.raised.toLocaleString()}
                    </td>
                    <td className="text-right p-2">
                      ${item.goal.toLocaleString()}
                    </td>
                    <td className="text-right p-2">
                      {((item.raised / item.goal) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        break;
      default:
        content = (
          <div className="flex items-center justify-center h-full text-slate-400">
            Component
          </div>
        );
    }

    return (
      <div
        key={component.id}
        className={baseClasses}
        style={style}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedComponent(component.id);
        }}
      >
        {content}
        {isSelected && (
          <div className="absolute -top-8 left-0 flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded text-xs">
            <button
              onClick={() => duplicateComponent(component.id)}
              title="Duplicate"
            >
              <Copy className="h-3 w-3" />
            </button>
            <button
              onClick={() => deleteComponent(component.id)}
              title="Delete"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-slate-900">
              Custom Report Builder
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-50"
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-50"
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Mode Selector */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("desktop")}
                className={`p-2 rounded ${viewMode === "desktop" ? "bg-white shadow-sm" : ""}`}
                title="Desktop View"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("tablet")}
                className={`p-2 rounded ${viewMode === "tablet" ? "bg-white shadow-sm" : ""}`}
                title="Tablet View"
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={`p-2 rounded ${viewMode === "mobile" ? "bg-white shadow-sm" : ""}`}
                title="Mobile View"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("design")}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  activeTab === "design"
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-600"
                }`}
              >
                <Layout className="h-4 w-4 inline mr-2" />
                Design
              </button>
              <button
                onClick={() => setActiveTab("brand")}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  activeTab === "brand"
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-600"
                }`}
              >
                <Palette className="h-4 w-4 inline mr-2" />
                Brand
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-4 py-2 rounded text-sm font-medium ${
                  activeTab === "preview"
                    ? "bg-white shadow-sm text-slate-900"
                    : "text-slate-600"
                }`}
              >
                <Eye className="h-4 w-4 inline mr-2" />
                Preview
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                <Save className="h-4 w-4 inline mr-2" />
                Save Template
              </button>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                <Download className="h-4 w-4 inline mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {activeTab === "design" && (
          <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
            {/* Component Library */}
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">
                Component Library
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {COMPONENT_LIBRARY.map((item) => (
                  <DraggableComponent
                    key={item.id}
                    item={item}
                    onDragStartCapture={() => {
                      setIsDragging(true);
                      setDraggedItem(item);
                    }}
                    onDragEndCapture={() => {
                      setIsDragging(false);
                      setDraggedItem(null);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Properties Panel */}
            {selectedComponent && (
              <div className="flex-1 p-4 overflow-auto">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Properties
                </h3>
                <ComponentProperties
                  component={
                    components.find((c) => c.id === selectedComponent)!
                  }
                  onUpdate={(updates) =>
                    updateComponent(selectedComponent, updates)
                  }
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "brand" && (
          <div className="w-80 bg-white border-r border-slate-200">
            <BrandingPanel config={brandConfig} onChange={setBrandConfig} />
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-auto bg-slate-100 p-8">
            <div className="flex justify-center">
              <CanvasDropZone
                ref={canvasRef}
                dimensions={canvasDimensions}
                components={components}
                onComponentRender={renderComponent}
                onCanvasClick={() => setSelectedComponent(null)}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      {isDragging && draggedItem && (
        <div
          className="fixed pointer-events-none z-50 bg-white border border-slate-300 rounded-lg p-3 shadow-lg"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          {(() => {
            const Icon = draggedItem.icon as React.ComponentType<{
              className?: string;
            }>;
            return <Icon className="h-5 w-5 text-slate-600 mx-auto mb-1" />;
          })()}
          <div className="text-xs text-slate-600 text-center">
            {draggedItem.name}
          </div>
        </div>
      )}
    </div>
  );
};

// Draggable Component for Library
const DraggableComponent: React.FC<{
  item: any;
  onDragStartCapture?: () => void;
  onDragEndCapture?: () => void;
}> = ({ item, onDragStartCapture, onDragEndCapture }) => {
  const Icon = item.icon as React.ComponentType<{ className?: string }>;
  return (
    <div
      draggable
      onDragStart={(e) => {
        onDragStartCapture?.();
        e.dataTransfer.setData("application/json", JSON.stringify(item));
        e.dataTransfer.effectAllowed = "copy";
      }}
      onDragEnd={() => onDragEndCapture?.()}
      className="flex flex-col items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-grab hover:border-blue-300 hover:bg-blue-50 transition-colors active:cursor-grabbing"
    >
      <Icon className="h-5 w-5 text-slate-600" />
      <span className="text-xs text-slate-600 text-center">{item.name}</span>
    </div>
  );
};

// Canvas Drop Zone
const CanvasDropZone = React.forwardRef<
  HTMLDivElement,
  {
    dimensions: { width: number; height: number };
    components: ReportComponent[];
    onComponentRender: (component: ReportComponent) => React.ReactNode;
    onCanvasClick: () => void;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
  }
>(
  (
    {
      dimensions,
      components,
      onComponentRender,
      onCanvasClick,
      onDrop,
      onDragOver,
    },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className="bg-white border border-slate-300 relative shadow-lg"
        style={{ width: dimensions.width, height: dimensions.height }}
        onClick={onCanvasClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Drop Zone Hint */}
        {components.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-slate-400">
              <Grid className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                Start Building Your Report
              </h3>
              <p className="text-sm">
                Drag components from the library to begin
              </p>
            </div>
          </div>
        )}

        {/* Render Components */}
        {components.map(onComponentRender)}
      </div>
    );
  },
);
CanvasDropZone.displayName = "CanvasDropZone";

// Component Properties Panel
const ComponentProperties: React.FC<{
  component: ReportComponent;
  onUpdate: (updates: Partial<ReportComponent>) => void;
}> = ({ component, onUpdate }) => {
  const updateConfig = (configUpdates: Partial<ComponentConfig>) => {
    onUpdate({ config: { ...component.config, ...configUpdates } });
  };
  const updatePosition = (positionUpdates: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }) => {
    onUpdate(positionUpdates);
  };

  return (
    <div className="space-y-4">
      {/* Position & Size */}
      <div>
        <h4 className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wide">
          Position & Size
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-slate-600 mb-1">X</label>
            <input
              type="number"
              value={component.x}
              onChange={(e) =>
                updatePosition({ x: parseInt(e.target.value, 10) })
              }
              className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Y</label>
            <input
              type="number"
              value={component.y}
              onChange={(e) =>
                updatePosition({ y: parseInt(e.target.value, 10) })
              }
              className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Width</label>
            <input
              type="number"
              value={component.width}
              onChange={(e) =>
                updatePosition({ width: parseInt(e.target.value, 10) })
              }
              className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Height</label>
            <input
              type="number"
              value={component.height}
              onChange={(e) =>
                updatePosition({ height: parseInt(e.target.value, 10) })
              }
              className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Type-specific properties */}
      {component.type === "text" && (
        <>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wide">
              Content
            </h4>
            <textarea
              value={component.config.content || ""}
              onChange={(e) => updateConfig({ content: e.target.value })}
              className="w-full px-2 py-1 text-xs border border-slate-300 rounded resize-none"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Size
                </label>
                <input
                  type="number"
                  value={component.config.fontSize || 14}
                  onChange={(e) =>
                    updateConfig({ fontSize: parseInt(e.target.value, 10) })
                  }
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Weight
                </label>
                <select
                  value={component.config.fontWeight || "normal"}
                  onChange={(e) =>
                    updateConfig({
                      fontWeight: e.target.value as "normal" | "bold",
                    })
                  }
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">
                Alignment
              </label>
              <select
                value={component.config.textAlign || "left"}
                onChange={(e) =>
                  updateConfig({
                    textAlign: e.target.value as "left" | "center" | "right",
                  })
                }
                className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Color</label>
              <input
                type="color"
                value={component.config.color || "#000000"}
                onChange={(e) => updateConfig({ color: e.target.value })}
                className="w-full h-8 border border-slate-300 rounded"
              />
            </div>
          </div>
        </>
      )}

      {component.type === "metric" && (
        <>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wide">
              Metric Data
            </h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={component.config.label || ""}
                  onChange={(e) => updateConfig({ label: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Value
                </label>
                <input
                  type="text"
                  value={String(component.config.value ?? "")}
                  onChange={(e) => updateConfig({ value: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Trend (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={component.config.trend ?? 0}
                  onChange={(e) =>
                    updateConfig({ trend: parseFloat(e.target.value) })
                  }
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {component.type === "chart" && (
        <>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wide">
              Chart Settings
            </h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={component.config.title || ""}
                  onChange={(e) => updateConfig({ title: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Chart Type
                </label>
                <select
                  value={component.config.chartType || "line"}
                  onChange={(e) =>
                    updateConfig({
                      chartType: e.target.value as
                        | "line"
                        | "bar"
                        | "area"
                        | "pie",
                    })
                  }
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                >
                  <option value="line">Line Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="pie">Pie Chart</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Data Source
                </label>
                <select
                  value={component.config.dataSource || "campaign_timeline"}
                  onChange={(e) => updateConfig({ dataSource: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                >
                  <option value="campaign_timeline">Campaign Timeline</option>
                  <option value="campaign_performance">
                    Campaign Performance
                  </option>
                </select>
              </div>
            </div>
          </div>
        </>
      )}

      {component.type === "image" && (
        <>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wide">
              Image Settings
            </h4>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={component.config.src || ""}
                  onChange={(e) => updateConfig({ src: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={component.config.alt || ""}
                  onChange={(e) => updateConfig({ alt: e.target.value })}
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Styling Properties */}
      <div>
        <h4 className="text-xs font-semibold text-slate-900 mb-2 uppercase tracking-wide">
          Styling
        </h4>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Background Color
            </label>
            <input
              type="color"
              value={component.config.backgroundColor || "#ffffff"}
              onChange={(e) =>
                updateConfig({ backgroundColor: e.target.value })
              }
              className="w-full h-8 border border-slate-300 rounded"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-slate-600 mb-1">
                Border Radius
              </label>
              <input
                type="number"
                value={component.config.borderRadius || 0}
                onChange={(e) =>
                  updateConfig({ borderRadius: parseInt(e.target.value, 10) })
                }
                className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">
                Padding
              </label>
              <input
                type="number"
                value={component.config.padding || 0}
                onChange={(e) =>
                  updateConfig({ padding: parseInt(e.target.value, 10) })
                }
                className="w-full px-2 py-1 text-xs border border-slate-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Branding Panel
const BrandingPanel: React.FC<{
  config: BrandConfig;
  onChange: (config: BrandConfig) => void;
}> = ({ config, onChange }) => {
  const updateConfig = (updates: Partial<BrandConfig>) =>
    onChange({ ...config, ...updates });

  return (
    <div className="p-4 space-y-6">
      <h3 className="text-lg font-semibold text-slate-900">
        Brand Configuration
      </h3>

      {/* Organization Info */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">
          Organization
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={config.organizationName}
              onChange={(e) =>
                updateConfig({ organizationName: e.target.value })
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Logo URL
            </label>
            <input
              type="url"
              value={config.logo}
              onChange={(e) => updateConfig({ logo: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <button className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg flex items-center justify-center gap-2">
            Upload Logo
          </button>
        </div>
      </div>

      {/* Color Palette */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">
          Color Palette
        </h4>
        <div className="space-y-3">
          <ColorRow
            label="Primary Color"
            value={config.primaryColor}
            onChange={(v) => updateConfig({ primaryColor: v })}
          />
          <ColorRow
            label="Secondary Color"
            value={config.secondaryColor}
            onChange={(v) => updateConfig({ secondaryColor: v })}
          />
          <ColorRow
            label="Accent Color"
            value={config.accentColor}
            onChange={(v) => updateConfig({ accentColor: v })}
          />
        </div>
      </div>

      {/* Typography */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">
          Typography
        </h4>
        <div>
          <label className="block text-xs text-slate-600 mb-1">
            Font Family
          </label>
          <select
            value={config.font}
            onChange={(e) => updateConfig({ font: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
          >
            <option value="Inter">Inter</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Lato">Lato</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Poppins">Poppins</option>
          </select>
        </div>
      </div>

      {/* Report Settings */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">
          Report Settings
        </h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Default Header
            </label>
            <input
              type="text"
              value={config.reportHeader}
              onChange={(e) => updateConfig({ reportHeader: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">
              Default Footer
            </label>
            <input
              type="text"
              value={config.reportFooter}
              onChange={(e) => updateConfig({ reportFooter: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Quick Brand Presets */}
      <div>
        <h4 className="text-sm font-semibold text-slate-900 mb-3">
          Quick Presets
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <PresetButton
            colors={["#3B82F6", "#059669", "#DC2626"]}
            onClick={() =>
              updateConfig({
                primaryColor: "#3B82F6",
                secondaryColor: "#059669",
                accentColor: "#DC2626",
              })
            }
            label="Corporate"
          />
          <PresetButton
            colors={["#7C3AED", "#059669", "#F59E0B"]}
            onClick={() =>
              updateConfig({
                primaryColor: "#7C3AED",
                secondaryColor: "#059669",
                accentColor: "#F59E0B",
              })
            }
            label="Creative"
          />
          <PresetButton
            colors={["#059669", "#0891B2", "#065F46"]}
            onClick={() =>
              updateConfig({
                primaryColor: "#059669",
                secondaryColor: "#0891B2",
                accentColor: "#065F46",
              })
            }
            label="Eco"
          />
          <PresetButton
            colors={["#DC2626", "#EA580C", "#991B1B"]}
            onClick={() =>
              updateConfig({
                primaryColor: "#DC2626",
                secondaryColor: "#EA580C",
                accentColor: "#991B1B",
              })
            }
            label="Bold"
          />
        </div>
      </div>
    </div>
  );
};

const ColorRow: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
}> = ({ label, value, onChange }) => (
  <div>
    <label className="block text-xs text-slate-600 mb-1">{label}</label>
    <div className="flex gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-10 border border-slate-300 rounded-lg"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg"
      />
    </div>
  </div>
);

const PresetButton: React.FC<{
  colors: string[];
  onClick: () => void;
  label: string;
}> = ({ colors, onClick, label }) => (
  <button
    onClick={onClick}
    className="p-3 border border-slate-300 rounded-lg hover:bg-slate-50"
  >
    <div className="flex gap-1 mb-1">
      {colors.map((c, i) => (
        <div
          key={i}
          className="w-3 h-3 rounded"
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
    <div className="text-xs text-slate-600">{label}</div>
  </button>
);

export default CustomReportBuilder;
