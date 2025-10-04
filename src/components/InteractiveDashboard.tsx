import clsx from "clsx";
import React, { useState, useCallback, useEffect } from "react";

import { Button } from "./ui-kit/Button";
// import { Modal } from "./ui-kit/Modal";
const Modal = ({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
import { Select } from "./ui-kit/Select";
import { Tooltip } from "./ui-kit/Tooltip";

// Widget configuration types
export interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  position: { row: number; col: number; rowSpan: number; colSpan: number };
  visible: boolean;
  props?: Record<string, any>;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  gridCols: number;
  gridRows: number;
}

export interface InteractiveDashboardProps {
  layout: DashboardLayout;
  onLayoutChange?: (layout: DashboardLayout) => void;
  onSaveLayout?: (layout: DashboardLayout) => void;
  availableWidgets: Array<{
    type: string;
    name: string;
    description: string;
    icon: string;
    defaultSize: { rowSpan: number; colSpan: number };
  }>;
  renderWidget: (widget: WidgetConfig) => React.ReactNode;
  editable?: boolean;
  className?: string;
}

// Grid item component
interface GridItemProps {
  widget: WidgetConfig;
  children: React.ReactNode;
  onMove?: (
    widgetId: string,
    newPosition: { row: number; col: number },
  ) => void;
  onResize?: (
    widgetId: string,
    newSize: { rowSpan: number; colSpan: number },
  ) => void;
  onRemove?: (widgetId: string) => void;
  editable?: boolean;
  gridCols: number;
}

const GridItem: React.FC<GridItemProps> = ({
  widget,
  children,
  onMove,
  onResize: _onResize,
  onRemove,
  editable = false,
  gridCols,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [_isResizing, _setIsResizing] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const gridStyle = {
    gridColumn: `${widget.position.col + 1} / span ${widget.position.colSpan}`,
    gridRow: `${widget.position.row + 1} / span ${widget.position.rowSpan}`,
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (!editable) return;
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", widget.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedWidgetId = e.dataTransfer.getData("text/plain");

    if (draggedWidgetId === widget.id) return;

    // Calculate drop position based on mouse position
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to grid coordinates (simplified)
    const col =
      Math.floor((x / rect.width) * widget.position.colSpan) +
      widget.position.col;
    const row =
      Math.floor((y / rect.height) * widget.position.rowSpan) +
      widget.position.row;

    onMove?.(draggedWidgetId, {
      row: Math.max(0, row),
      col: Math.max(0, Math.min(col, gridCols - 1)),
    });
  };

  return (
    <div
      style={gridStyle}
      className={clsx(
        "relative group rounded-lg overflow-hidden transition-all duration-200",
        isDragging && "opacity-50 transform rotate-2",
        editable && "hover:ring-2 hover:ring-blue-500/50",
      )}
      draggable={editable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Widget controls */}
      {editable && showControls && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Tooltip content="Drag to move">
            <button className="p-1 bg-slate-800/90 text-white rounded text-xs hover:bg-slate-700 cursor-move">
              ⋮⋮
            </button>
          </Tooltip>

          <Tooltip content="Remove widget">
            <button
              onClick={() => onRemove?.(widget.id)}
              className="p-1 bg-red-800/90 text-white rounded text-xs hover:bg-red-700"
            >
              ✕
            </button>
          </Tooltip>
        </div>
      )}

      {/* Resize handles */}
      {editable && showControls && (
        <>
          {/* Bottom-right resize handle */}
          <div
            className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize opacity-70 hover:opacity-100"
            onMouseDown={(e) => {
              _setIsResizing(true);
              e.preventDefault();
            }}
          />
        </>
      )}

      {children}
    </div>
  );
};

// Main dashboard component
export const InteractiveDashboard: React.FC<InteractiveDashboardProps> = ({
  layout,
  onLayoutChange,
  onSaveLayout,
  availableWidgets,
  renderWidget,
  editable = false,
  className,
}) => {
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout>(layout);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string>("");
  const [_dragOverPosition, _setDragOverPosition] = useState<{
    row: number;
    col: number;
  } | null>(null);

  useEffect(() => {
    setCurrentLayout(layout);
  }, [layout]);

  // Find empty position for new widget
  const findEmptyPosition = useCallback(
    (rowSpan: number, colSpan: number): { row: number; col: number } => {
      const { gridRows, gridCols, widgets } = currentLayout;

      // Create a grid to track occupied positions
      const occupied = Array(gridRows)
        .fill(null)
        .map(() => Array(gridCols).fill(false));

      widgets.forEach((widget) => {
        if (!widget.visible) return;
        for (
          let r = widget.position.row;
          r < widget.position.row + widget.position.rowSpan;
          r++
        ) {
          for (
            let c = widget.position.col;
            c < widget.position.col + widget.position.colSpan;
            c++
          ) {
            if (r < gridRows && c < gridCols) {
              occupied[r][c] = true;
            }
          }
        }
      });

      // Find first available position
      for (let row = 0; row <= gridRows - rowSpan; row++) {
        for (let col = 0; col <= gridCols - colSpan; col++) {
          let canPlace = true;

          for (let r = row; r < row + rowSpan && canPlace; r++) {
            for (let c = col; c < col + colSpan && canPlace; c++) {
              if (occupied[r][c]) {
                canPlace = false;
              }
            }
          }

          if (canPlace) {
            return { row, col };
          }
        }
      }

      // If no space found, return bottom position
      return { row: Math.max(0, gridRows - rowSpan), col: 0 };
    },
    [currentLayout],
  );

  // Handle widget movement
  const handleWidgetMove = useCallback(
    (widgetId: string, newPosition: { row: number; col: number }) => {
      const newLayout = {
        ...currentLayout,
        widgets: currentLayout.widgets.map((widget) =>
          widget.id === widgetId
            ? { ...widget, position: { ...widget.position, ...newPosition } }
            : widget,
        ),
      };

      setCurrentLayout(newLayout);
      onLayoutChange?.(newLayout);
    },
    [currentLayout, onLayoutChange],
  );

  // Handle widget resize
  const handleWidgetResize = useCallback(
    (widgetId: string, newSize: { rowSpan: number; colSpan: number }) => {
      const newLayout = {
        ...currentLayout,
        widgets: currentLayout.widgets.map((widget) =>
          widget.id === widgetId
            ? { ...widget, position: { ...widget.position, ...newSize } }
            : widget,
        ),
      };

      setCurrentLayout(newLayout);
      onLayoutChange?.(newLayout);
    },
    [currentLayout, onLayoutChange],
  );

  // Handle widget removal
  const handleWidgetRemove = useCallback(
    (widgetId: string) => {
      const newLayout = {
        ...currentLayout,
        widgets: currentLayout.widgets.filter(
          (widget) => widget.id !== widgetId,
        ),
      };

      setCurrentLayout(newLayout);
      onLayoutChange?.(newLayout);
    },
    [currentLayout, onLayoutChange],
  );

  // Handle adding new widget
  const handleAddWidget = useCallback(
    (widgetType: string) => {
      const availableWidget = availableWidgets.find(
        (w) => w.type === widgetType,
      );
      if (!availableWidget) return;

      const position = findEmptyPosition(
        availableWidget.defaultSize.rowSpan,
        availableWidget.defaultSize.colSpan,
      );

      const newWidget: WidgetConfig = {
        id: `${widgetType}_${Date.now()}`,
        type: widgetType,
        title: availableWidget.name,
        position: {
          ...position,
          ...availableWidget.defaultSize,
        },
        visible: true,
      };

      const newLayout = {
        ...currentLayout,
        widgets: [...currentLayout.widgets, newWidget],
      };

      setCurrentLayout(newLayout);
      onLayoutChange?.(newLayout);
      setShowAddWidget(false);
      setSelectedWidget("");
    },
    [currentLayout, availableWidgets, onLayoutChange, findEmptyPosition],
  );

  // Toggle widget visibility
  const toggleWidgetVisibility = useCallback(
    (widgetId: string) => {
      const newLayout = {
        ...currentLayout,
        widgets: currentLayout.widgets.map((widget) =>
          widget.id === widgetId
            ? { ...widget, visible: !widget.visible }
            : widget,
        ),
      };

      setCurrentLayout(newLayout);
      onLayoutChange?.(newLayout);
    },
    [currentLayout, onLayoutChange],
  );

  const visibleWidgets = currentLayout.widgets.filter(
    (widget) => widget.visible,
  );

  return (
    <div className={clsx("relative", className)}>
      {/* Dashboard controls */}
      {editable && (
        <div className="flex items-center justify-between mb-6 p-4 bg-slate-900/40 border border-slate-800 rounded-lg">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-white">
              Dashboard Layout
            </h2>
            <span className="text-sm text-slate-400">
              {visibleWidgets.length} widgets active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCustomizing(!isCustomizing)}
            >
              {isCustomizing ? "Done Customizing" : "Customize"}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAddWidget(true)}
            >
              Add Widget
            </Button>

            {onSaveLayout && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSaveLayout(currentLayout)}
              >
                Save Layout
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Widget visibility controls */}
      {isCustomizing && (
        <div className="mb-6 p-4 bg-slate-900/40 border border-slate-800 rounded-lg">
          <h3 className="text-md font-medium text-white mb-3">
            Widget Visibility
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {currentLayout.widgets.map((widget) => (
              <label
                key={widget.id}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={widget.visible}
                  onChange={() => toggleWidgetVisibility(widget.id)}
                  className="rounded border-slate-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                />
                <span
                  className={widget.visible ? "text-white" : "text-slate-400"}
                >
                  {widget.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Grid container */}
      <div
        className={clsx(
          "grid gap-6 auto-rows-fr",
          _dragOverPosition &&
            "bg-blue-500/10 border-2 border-dashed border-blue-500",
        )}
        style={{
          gridTemplateColumns: `repeat(${currentLayout.gridCols}, 1fr)`,
        }}
      >
        {visibleWidgets.map((widget) => (
          <GridItem
            key={widget.id}
            widget={widget}
            onMove={handleWidgetMove}
            onResize={handleWidgetResize}
            onRemove={handleWidgetRemove}
            editable={editable && isCustomizing}
            gridCols={currentLayout.gridCols}
          >
            {renderWidget(widget)}
          </GridItem>
        ))}

        {/* Empty grid placeholder when customizing */}
        {isCustomizing && visibleWidgets.length === 0 && (
          <div className="col-span-full flex items-center justify-center py-16 border-2 border-dashed border-slate-700 rounded-lg">
            <div className="text-center">
              <p className="text-slate-400 mb-4">No widgets active</p>
              <Button onClick={() => setShowAddWidget(true)}>
                Add Your First Widget
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Widget Modal */}
      <Modal
        open={showAddWidget}
        onClose={() => {
          setShowAddWidget(false);
          setSelectedWidget("");
        }}
        title="Add Widget"
      >
        <div className="space-y-4">
          <p className="text-slate-400">
            Choose a widget to add to your dashboard:
          </p>

          <Select
            options={availableWidgets.map((widget) => ({
              label: widget.name,
              value: widget.type,
              description: widget.description,
              icon: widget.icon,
            }))}
            value={selectedWidget}
            onChange={setSelectedWidget}
            placeholder="Select a widget type..."
            searchable
          />

          {selectedWidget && (
            <div className="p-4 bg-slate-800/50 rounded-lg">
              {(() => {
                const widget = availableWidgets.find(
                  (w) => w.type === selectedWidget,
                );
                return widget ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{widget.icon}</span>
                      <h4 className="font-medium text-white">{widget.name}</h4>
                    </div>
                    <p className="text-sm text-slate-400 mb-3">
                      {widget.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      Size: {widget.defaultSize.colSpan} ×{" "}
                      {widget.defaultSize.rowSpan} grid cells
                    </p>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddWidget(false);
                setSelectedWidget("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => handleAddWidget(selectedWidget)}
              disabled={!selectedWidget}
            >
              Add Widget
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InteractiveDashboard;
