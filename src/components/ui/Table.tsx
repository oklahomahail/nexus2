import { clsx } from "clsx";

// Base table component
export interface TableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {}

export const Table: React.FC<TableProps> = ({ className, ...props }) => (
  <div className="relative overflow-hidden rounded-2xl bg-panel border border-border">
    <table className={clsx("w-full text-left", className)} {...props} />
  </div>
);

// Table header
export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader: React.FC<TableHeaderProps> = ({
  className,
  ...props
}) => (
  <thead
    className={clsx("bg-elevated border-b border-border", className)}
    {...props}
  />
);

// Table body
export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody: React.FC<TableBodyProps> = ({
  className,
  ...props
}) => <tbody className={clsx(className)} {...props} />;

// Table row
export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  hover?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({
  className,
  selected = false,
  hover = true,
  ...props
}) => (
  <tr
    className={clsx(
      "border-b border-border/50 transition-colors",
      hover && "hover:bg-elevated/50",
      selected && "bg-accent/10",
      className,
    )}
    {...props}
  />
);

// Table header cell
export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableHeaderCellElement> {}

export const TableHead: React.FC<TableHeadProps> = ({
  className,
  ...props
}) => (
  <th
    className={clsx(
      "px-4 py-3 text-label-caps text-muted font-medium text-left",
      className,
    )}
    {...props}
  />
);

// Table cell
export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableDataCellElement> {}

export const TableCell: React.FC<TableCellProps> = ({
  className,
  ...props
}) => (
  <td className={clsx("px-4 py-3 text-body text-text", className)} {...props} />
);

// Loading skeleton row
export interface TableSkeletonRowProps {
  columns: number;
}

export const TableSkeletonRow: React.FC<TableSkeletonRowProps> = ({
  columns,
}) => (
  <TableRow hover={false}>
    {Array.from({ length: columns }).map((_, i) => (
      <TableCell key={i}>
        <div className="loading-skeleton h-4 rounded" />
      </TableCell>
    ))}
  </TableRow>
);

// Empty state
export interface TableEmptyProps {
  colSpan: number;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export const TableEmpty: React.FC<TableEmptyProps> = ({
  colSpan,
  title = "No data available",
  description,
  action,
}) => (
  <TableRow hover={false}>
    <TableCell colSpan={colSpan} className="text-center py-12">
      <div className="space-y-3">
        <div className="text-body font-medium text-muted">{title}</div>
        {description && (
          <div className="text-body-sm text-muted/80">{description}</div>
        )}
        {action && <div>{action}</div>}
      </div>
    </TableCell>
  </TableRow>
);
