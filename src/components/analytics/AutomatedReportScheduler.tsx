// AutomatedReportScheduler.tsx
import {
  Calendar,
  Clock,
  Users,
  Mail,
  FileText,
  Play,
  Pause,
  Trash2,
  Copy,
  Edit3,
  Plus,
  Download,
  CheckCircle,
  AlertCircle,
  UserCheck,
  Target,
  BarChart3,
  Search,
  MoreVertical,
  Repeat,
  Slack,
  FolderOpen,
  Eye,
  History,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";

/* =========================
   Types
   ========================= */
type Frequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly";

interface Recipient {
  id: string;
  type: "user" | "role" | "external";
  name: string;
  email: string;
  role?: string;
  isActive: boolean;
}

type DeliveryFormat = "pdf" | "excel" | "csv";
type DeliveryType = "email" | "slack" | "drive" | "ftp" | "webhook";

interface DeliveryMethod {
  type: DeliveryType;
  isActive: boolean;
  config: {
    subject?: string;
    message?: string;
    channel?: string;
    folder?: string;
    url?: string;
    format: DeliveryFormat;
  };
}

interface ScheduleCondition {
  type:
    | "campaign_milestone"
    | "goal_achieved"
    | "threshold_reached"
    | "date_range";
  config: {
    campaignId?: string;
    goalId?: string;
    threshold?: number;
    metric?: string;
    operator?: "gt" | "lt" | "eq" | "gte" | "lte";
  };
}

interface ReportSchedule {
  id: string;
  name: string;
  description: string;
  templateId: string;
  templateName: string;
  frequency: Frequency;
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31
  time: string; // HH:mm
  timezone: string;
  isActive: boolean;
  recipients: Recipient[];
  deliveryMethods: DeliveryMethod[];
  lastRun?: Date | string;
  nextRun: Date | string;
  runCount: number;
  createdAt: Date | string;
  updatedBy: string;
  conditions?: ScheduleCondition[];
}

interface DeliveryResult {
  method: string;
  recipient: string;
  status: "sent" | "failed" | "pending";
  timestamp: Date | string;
  error?: string;
}

interface ScheduleRun {
  id: string;
  scheduleId: string;
  startTime: Date | string;
  endTime?: Date | string;
  status: "running" | "completed" | "failed" | "cancelled";
  reportUrl?: string;
  error?: string;
  deliveryResults?: DeliveryResult[];
}

/* =========================
   Template Catalog (mock)
   ========================= */
const REPORT_TEMPLATES = [
  {
    id: "executive_summary",
    name: "Executive Summary",
    description: "High-level overview for board meetings",
    icon: Target,
  },
  {
    id: "campaign_performance",
    name: "Campaign Performance",
    description: "Detailed campaign analytics",
    icon: BarChart3,
  },
  {
    id: "donor_insights",
    name: "Donor Insights",
    description: "Donor behavior and engagement metrics",
    icon: Users,
  },
  {
    id: "financial_summary",
    name: "Financial Summary",
    description: "Revenue and goal tracking",
    icon: FileText,
  },
] as const;

/* =========================
   Date helpers (safe)
   ========================= */
const asDate = (d?: Date | string): Date | null => {
  if (!d) return null;
  const v = typeof d === "string" ? new Date(d) : d;
  return isNaN(v.getTime()) ? null : v;
};

const formatDate = (d?: Date | string) => {
  const dt = asDate(d);
  return dt ? dt.toLocaleDateString() : "—";
};

const formatTime = (d?: Date | string) => {
  const dt = asDate(d);
  return dt ? dt.toLocaleTimeString() : "—";
};

const secondsBetween = (
  a?: Date | string,
  b?: Date | string,
): number | null => {
  const aDt = asDate(a);
  const bDt = asDate(b);
  if (!aDt || !bDt) return null;
  return Math.round((bDt.getTime() - aDt.getTime()) / 1000);
};

const getOrdinalSuffix = (day: number) => {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const getFrequencyDisplay = (
  frequency: Frequency,
  dayOfWeek?: number,
  dayOfMonth?: number,
) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  switch (frequency) {
    case "daily":
      return "Daily";
    case "weekly":
      return `Weekly (${days[dayOfWeek ?? 0]})`;
    case "biweekly":
      return `Bi-weekly (${days[dayOfWeek ?? 0]})`;
    case "monthly":
      return `Monthly (${dayOfMonth ?? 1}${getOrdinalSuffix(dayOfMonth ?? 1)})`;
    case "quarterly":
      return "Quarterly";
    case "yearly":
      return "Yearly";
    default:
      return frequency;
  }
};

const formatNextRun = (date: Date | string) => {
  const dt = asDate(date);
  if (!dt) return "—";
  const now = new Date();
  const diffDays = Math.ceil(
    (dt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `In ${diffDays} days`;
  return dt.toLocaleDateString();
};

/* =========================
   Modal: Create Schedule
   ========================= */
type SaveScheduleFn = (
  schedule: Omit<ReportSchedule, "id" | "runCount" | "createdAt" | "updatedBy">,
) => void;

const CreateScheduleModal: React.FC<{
  onClose: () => void;
  onSave: SaveScheduleFn;
  templates: typeof REPORT_TEMPLATES;
}> = ({ onClose, onSave, templates }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<
    Omit<ReportSchedule, "id" | "runCount" | "createdAt" | "updatedBy">
  >({
    name: "",
    description: "",
    templateId: "",
    templateName: "",
    frequency: "weekly",
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: "09:00",
    timezone: "America/New_York",
    isActive: true,
    recipients: [],
    deliveryMethods: [],
    lastRun: undefined,
    nextRun: new Date(),
    conditions: [],
  });

  const [newRecipient, setNewRecipient] = useState<
    Pick<Recipient, "type" | "name" | "email" | "role">
  >({
    type: "user",
    name: "",
    email: "",
    role: "",
  });

  const addRecipient = () => {
    if (!newRecipient.name || !newRecipient.email) return;
    const r: Recipient = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      isActive: true,
      ...newRecipient,
    };
    setFormData((prev) => ({ ...prev, recipients: [...prev.recipients, r] }));
    setNewRecipient({ type: "user", name: "", email: "", role: "" });
  };

  const removeRecipient = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((r) => r.id !== id),
    }));
  };

  const addEmailDelivery = () => {
    const dm: DeliveryMethod = {
      type: "email",
      isActive: true,
      config: {
        subject: `${formData.name || "Report"} - {{date}}`,
        message: "Please find the attached report.",
        format: "pdf",
      },
    };
    setFormData((prev) => ({
      ...prev,
      deliveryMethods: [...prev.deliveryMethods, dm],
    }));
  };

  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const canProceed =
    (step === 1 && !!formData.name) ||
    (step === 2 && !!formData.templateId) ||
    (step === 3 && formData.recipients.length > 0) ||
    (step === 4 && formData.deliveryMethods.length > 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      next();
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Create Report Schedule
              </h2>
              <p className="text-sm text-slate-600 mt-1">Step {step} of 4</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((num) => (
                <React.Fragment key={num}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= num
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {num}
                  </div>
                  {num < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${step > num ? "bg-blue-600" : "bg-slate-200"}`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-600">
              <span>Basic Info</span>
              <span>Template & Timing</span>
              <span>Recipients</span>
              <span>Delivery</span>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="p-6 space-y-6">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Schedule Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Weekly Executive Dashboard"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, description: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of this report schedule..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Report Template
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {templates.map((t) => {
                    const Icon = t.icon;
                    const checked = formData.templateId === t.id;
                    return (
                      <label key={t.id} className="cursor-pointer">
                        <input
                          type="radio"
                          name="template"
                          value={t.id}
                          checked={checked}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              templateId: e.target.value,
                              templateName: t.name,
                            }))
                          }
                          className="sr-only"
                        />
                        <div
                          className={`p-4 border-2 rounded-lg transition-all ${checked ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-6 w-6 text-blue-600" />
                            <div>
                              <div className="font-medium text-slate-900">
                                {t.name}
                              </div>
                              <div className="text-sm text-slate-600">
                                {t.description}
                              </div>
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        frequency: e.target.value as Frequency,
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, time: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {(formData.frequency === "weekly" ||
                formData.frequency === "biweekly") && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Day of Week
                  </label>
                  <select
                    value={formData.dayOfWeek ?? 1}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        dayOfWeek: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>
              )}

              {formData.frequency === "monthly" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Day of Month
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={formData.dayOfMonth ?? 1}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        dayOfMonth: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Add Recipients
                </label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select
                    value={newRecipient.type}
                    onChange={(e) =>
                      setNewRecipient((p) => ({
                        ...p,
                        type: e.target.value as Recipient["type"],
                      }))
                    }
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="role">Role</option>
                    <option value="external">External</option>
                  </select>
                  <input
                    type="text"
                    value={newRecipient.name}
                    onChange={(e) =>
                      setNewRecipient((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Name"
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="email"
                    value={newRecipient.email}
                    onChange={(e) =>
                      setNewRecipient((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="Email"
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addRecipient}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Add
                  </button>
                </div>
              </div>

              {formData.recipients.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">
                    Recipients ({formData.recipients.length})
                  </h4>
                  <div className="space-y-2">
                    {formData.recipients.map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <UserCheck className="h-5 w-5 text-slate-400" />
                          <div>
                            <div className="font-medium text-slate-900">
                              {r.name}
                            </div>
                            <div className="text-sm text-slate-600">
                              {r.email}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              r.type === "user"
                                ? "bg-blue-100 text-blue-800"
                                : r.type === "role"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {r.type}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRecipient(r.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">
                  Delivery Methods
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={addEmailDelivery}
                    className="flex items-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-lg hover:border-slate-400 transition-colors"
                  >
                    <Mail className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-600">Add Email Delivery</span>
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-lg opacity-50 cursor-not-allowed"
                  >
                    <Slack className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-600">Add Slack Delivery</span>
                  </button>

                  <button
                    type="button"
                    className="flex items-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-lg opacity-50 cursor-not-allowed"
                  >
                    <FolderOpen className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-600">Add Drive Delivery</span>
                  </button>
                </div>
              </div>

              {formData.deliveryMethods.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-3">
                    Configured Delivery Methods
                  </h4>
                  <div className="space-y-3">
                    {formData.deliveryMethods.map((m, i) => (
                      <div
                        key={`${m.type}-${i}`}
                        className="p-4 border border-slate-200 rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {m.type === "email" && (
                              <Mail className="h-5 w-5 text-blue-600" />
                            )}
                            {m.type === "slack" && (
                              <Slack className="h-5 w-5 text-green-600" />
                            )}
                            {m.type === "drive" && (
                              <FolderOpen className="h-5 w-5 text-yellow-600" />
                            )}
                            <div>
                              <div className="font-medium text-slate-900 capitalize">
                                {m.type} Delivery
                              </div>
                              <div className="text-sm text-slate-600">
                                {m.config.subject ||
                                  m.config.channel ||
                                  m.config.folder ||
                                  "—"}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData((p) => ({
                                ...p,
                                deliveryMethods: p.deliveryMethods.filter(
                                  (_, idx) => idx !== i,
                                ),
                              }))
                            }
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200">
            <div>
              {step > 1 && (
                <button
                  type="button"
                  onClick={back}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canProceed}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-medium"
              >
                {step === 4 ? "Create Schedule" : "Next"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================
   Main Component
   ========================= */
const AutomatedReportScheduler: React.FC = () => {
  // Schedules & Runs
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [runHistory, setRunHistory] = useState<ScheduleRun[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<
    "schedules" | "history" | "templates"
  >("schedules");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data (initialize once)
  useEffect(() => {
    if (schedules.length > 0) return;
    const mockSchedules: ReportSchedule[] = [
      {
        id: "1",
        name: "Weekly Executive Dashboard",
        description: "Weekly performance summary for leadership team",
        templateId: "executive_summary",
        templateName: "Executive Summary",
        frequency: "weekly",
        dayOfWeek: 1,
        time: "09:00",
        timezone: "America/New_York",
        isActive: true,
        recipients: [
          {
            id: "1",
            type: "role",
            name: "Executive Team",
            email: "executives@nonprofit.org",
            role: "executive",
            isActive: true,
          },
          {
            id: "2",
            type: "role",
            name: "Board Members",
            email: "board@nonprofit.org",
            role: "board",
            isActive: true,
          },
        ],
        deliveryMethods: [
          {
            type: "email",
            isActive: true,
            config: {
              subject: "Weekly Executive Dashboard - {{date}}",
              message: "Please find attached.",
              format: "pdf",
            },
          },
          {
            type: "slack",
            isActive: true,
            config: {
              channel: "#leadership",
              message: "Weekly dashboard is ready! 📊",
              format: "pdf",
            },
          },
        ],
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 24 * 3600 * 1000),
        runCount: 12,
        createdAt: new Date("2024-05-01T10:00:00"),
        updatedBy: "Sarah Johnson",
      },
      {
        id: "2",
        name: "Monthly Campaign Report",
        description: "Comprehensive monthly campaign performance analysis",
        templateId: "campaign_performance",
        templateName: "Campaign Performance",
        frequency: "monthly",
        dayOfMonth: 1,
        time: "08:00",
        timezone: "America/New_York",
        isActive: true,
        recipients: [
          {
            id: "3",
            type: "role",
            name: "Development Team",
            email: "development@nonprofit.org",
            role: "development",
            isActive: true,
          },
          {
            id: "4",
            type: "external",
            name: "Board Chair",
            email: "chair@boardmember.com",
            isActive: true,
          },
        ],
        deliveryMethods: [
          {
            type: "email",
            isActive: true,
            config: {
              subject:
                "Monthly Campaign Performance Report - {{month}} {{year}}",
              message: "Attached is the report.",
              format: "pdf",
            },
          },
          {
            type: "drive",
            isActive: true,
            config: { folder: "/Reports/Monthly Campaigns", format: "excel" },
          },
        ],
        lastRun: new Date("2024-08-01T08:00:00"),
        nextRun: new Date("2024-09-01T08:00:00"),
        runCount: 4,
        createdAt: new Date("2024-04-15T14:30:00"),
        updatedBy: "Mike Chen",
      },
    ];

    const mockRunHistory: ScheduleRun[] = [
      {
        id: "r1",
        scheduleId: "1",
        startTime: new Date(Date.now() - 1000 * 60 * 10),
        endTime: new Date(Date.now() - 1000 * 60 * 7),
        status: "completed",
        reportUrl: "/reports/executive_summary_2024-08-12.pdf",
        deliveryResults: [
          {
            method: "email",
            recipient: "executives@nonprofit.org",
            status: "sent",
            timestamp: new Date(),
          },
          {
            method: "slack",
            recipient: "#leadership",
            status: "sent",
            timestamp: new Date(),
          },
        ],
      },
      {
        id: "r2",
        scheduleId: "2",
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10 + 1000 * 300),
        status: "completed",
        reportUrl: "/reports/campaign_performance_2024-08.pdf",
        deliveryResults: [
          {
            method: "email",
            recipient: "development@nonprofit.org",
            status: "sent",
            timestamp: new Date(),
          },
          {
            method: "drive",
            recipient: "/Reports/Monthly Campaigns",
            status: "sent",
            timestamp: new Date(),
          },
        ],
      },
      {
        id: "r3",
        scheduleId: "1",
        startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
        endTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14 + 90 * 1000),
        status: "failed",
        error: "Template rendering failed: Missing campaign data",
        deliveryResults: [],
      },
    ];

    setSchedules(mockSchedules);
    setRunHistory(mockRunHistory);
  }, [schedules.length]);

  /* ===== Filters ===== */
  const filteredSchedules = useMemo(() => {
    let filtered = schedules;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.templateName.toLowerCase().includes(q),
      );
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((s) =>
        filterStatus === "active" ? s.isActive : !s.isActive,
      );
    }
    return filtered;
  }, [schedules, searchTerm, filterStatus]);

  /* ===== Actions ===== */
  const toggleScheduleStatus = useCallback((scheduleId: string) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId ? { ...s, isActive: !s.isActive } : s,
      ),
    );
  }, []);

  const deleteSchedule = useCallback((scheduleId: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
  }, []);

  const duplicateSchedule = useCallback((scheduleId: string) => {
    setSchedules((prev) => {
      const s = prev.find((x) => x.id === scheduleId);
      if (!s) return prev;
      const dup: ReportSchedule = {
        ...s,
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        name: `${s.name} (Copy)`,
        isActive: false,
        runCount: 0,
        createdAt: new Date(),
        updatedBy: "Current User",
      };
      return [...prev, dup];
    });
  }, []);

  const runScheduleNow = useCallback(
    (scheduleId: string) => {
      const schedule = schedules.find((s) => s.id === scheduleId);
      if (!schedule) return;

      const newRun: ScheduleRun = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        scheduleId,
        startTime: new Date(),
        status: "running",
        deliveryResults: [],
      };
      setRunHistory((prev) => [newRun, ...prev]);

      // simulate
      setTimeout(() => {
        const completed: ScheduleRun = {
          ...newRun,
          status: "completed",
          endTime: new Date(),
          reportUrl: `/reports/${schedule.templateId}_${Date.now()}.pdf`,
          deliveryResults: schedule.deliveryMethods.map((m) => ({
            method: m.type,
            recipient: m.config.channel || m.config.folder || "recipients",
            status: "sent",
            timestamp: new Date(),
          })),
        };
        setRunHistory((prev) =>
          prev.map((r) => (r.id === newRun.id ? completed : r)),
        );
        setSchedules((prev) =>
          prev.map((s) =>
            s.id === scheduleId
              ? { ...s, runCount: s.runCount + 1, lastRun: new Date() }
              : s,
          ),
        );
      }, 1500);
    },
    [schedules],
  );

  /* ===== Icons ===== */
  const getStatusIcon = (status: ScheduleRun["status"]) => {
    switch (status) {
      case "running":
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  /* ===== Render ===== */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Report Scheduling
          </h1>
          <p className="text-slate-600 mt-1">
            Automate report generation and distribution for your stakeholders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            <Plus className="h-4 w-4" />
            New Schedule
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "schedules", label: "Schedules", icon: Calendar },
            { id: "history", label: "Run History", icon: History },
            { id: "templates", label: "Templates", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Schedules Tab */}
      {activeTab === "schedules" && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search schedules..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as typeof filterStatus)
              }
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Schedules</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Schedules List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredSchedules.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">{s.name}</h3>
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          s.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {s.isActive ? (
                          <>
                            <Play className="h-3 w-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <Pause className="h-3 w-3" />
                            Paused
                          </>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{s.description}</p>
                  </div>
                  <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">Template:</span>
                    <span className="font-medium text-slate-900">
                      {s.templateName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Repeat className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">Frequency:</span>
                    <span className="font-medium text-slate-900">
                      {getFrequencyDisplay(
                        s.frequency,
                        s.dayOfWeek,
                        s.dayOfMonth,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">Time:</span>
                    <span className="font-medium text-slate-900">{s.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">Next run:</span>
                    <span
                      className={`font-medium ${asDate(s.nextRun)! < new Date() ? "text-red-600" : "text-slate-900"}`}
                    >
                      {formatNextRun(s.nextRun)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600">Recipients:</span>
                    <span className="font-medium text-slate-900">
                      {s.recipients.length}
                    </span>
                  </div>
                </div>

                {/* Last Run */}
                {s.lastRun && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-slate-600">Last run:</span>
                        <span className="text-slate-900">
                          {formatDate(s.lastRun)}
                        </span>
                      </div>
                      <span className="text-slate-500">
                        {s.runCount} total runs
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => runScheduleNow(s.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded-lg"
                  >
                    <Play className="h-3 w-3" />
                    Run Now
                  </button>
                  <button
                    onClick={() => toggleScheduleStatus(s.id)}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg ${
                      s.isActive
                        ? "bg-orange-100 hover:bg-orange-200 text-orange-700"
                        : "bg-green-100 hover:bg-green-200 text-green-700"
                    }`}
                  >
                    {s.isActive ? (
                      <>
                        <Pause className="h-3 w-3" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" />
                        Activate
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => duplicateSchedule(s.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                  <button
                    onClick={() => deleteSchedule(s.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty state */}
          {filteredSchedules.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                {searchTerm || filterStatus !== "all"
                  ? "No schedules match your filters"
                  : "No schedules created yet"}
              </h3>
              <p className="text-slate-600 mb-4">
                {searchTerm || filterStatus !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Create your first automated report schedule to get started."}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Create Schedule
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Run History Tab */}
      {activeTab === "history" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Recent Report Runs
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Track the execution history of your scheduled reports
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Delivery
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {runHistory.map((run) => {
                  const schedule = schedules.find(
                    (s) => s.id === run.scheduleId,
                  );
                  const durSec = run.endTime
                    ? secondsBetween(run.startTime, run.endTime)
                    : null;
                  const results = Array.isArray(run.deliveryResults)
                    ? run.deliveryResults
                    : [];

                  return (
                    <tr key={run.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {schedule?.name ?? "Unknown Schedule"}
                          </div>
                          <div className="text-sm text-slate-500">
                            {schedule?.templateName ?? "—"}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(run.status)}
                          <span
                            className={`text-sm font-medium ${
                              run.status === "completed"
                                ? "text-green-700"
                                : run.status === "failed"
                                  ? "text-red-700"
                                  : run.status === "running"
                                    ? "text-blue-700"
                                    : "text-gray-700"
                            }`}
                          >
                            {run.status.charAt(0).toUpperCase() +
                              run.status.slice(1)}
                          </span>
                        </div>
                        {run.error && (
                          <div
                            className="text-xs text-red-600 mt-1 max-w-xs truncate"
                            title={run.error}
                          >
                            {run.error}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div>{formatDate(run.startTime)}</div>
                        <div>{formatTime(run.startTime)}</div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {durSec !== null
                          ? `${durSec}s`
                          : run.status === "running"
                            ? "Running…"
                            : "—"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {results.map((res, index) => (
                            <div
                              key={`${run.id}-${index}`}
                              className="flex items-center gap-2 text-xs"
                            >
                              {res.status === "sent" ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : res.status === "failed" ? (
                                <AlertCircle className="h-3 w-3 text-red-500" />
                              ) : (
                                <Clock className="h-3 w-3 text-gray-400" />
                              )}
                              <span className="text-slate-600">
                                {res.method} → {res.recipient}
                              </span>
                            </div>
                          ))}
                          {results.length === 0 && (
                            <span className="text-xs text-slate-400">
                              No deliveries
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          {run.reportUrl && (
                            <a
                              href={run.reportUrl}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                              aria-label="Download report"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                          <button
                            className="text-slate-600 hover:text-slate-800 transition-colors"
                            aria-label="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {runHistory.length === 0 && (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                No run history yet
              </h3>
              <p className="text-slate-600">
                Report execution history will appear here once schedules start
                running.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REPORT_TEMPLATES.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.id}
                className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {t.name}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {t.description}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => console.log("Edit template:", t.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded-lg"
                      >
                        <Edit3 className="h-3 w-3" />
                        Edit Template
                      </button>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-medium rounded-lg"
                      >
                        <Calendar className="h-3 w-3" />
                        Schedule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Create New Template Card */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-slate-400 transition-colors">
            <div className="text-center">
              <div className="p-3 bg-slate-200 rounded-lg mx-auto w-fit mb-4">
                <Plus className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-1">
                Create New Template
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Build a custom report template with the visual editor
              </p>
              <button
                onClick={() => console.log("Create new template")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg"
              >
                Open Builder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showCreateModal && (
        <CreateScheduleModal
          templates={REPORT_TEMPLATES}
          onClose={() => setShowCreateModal(false)}
          onSave={(data) => {
            const newSchedule: ReportSchedule = {
              id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              ...data,
              runCount: 0,
              createdAt: new Date(),
              updatedBy: "Current User",
            };
            setSchedules((prev) => [...prev, newSchedule]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default AutomatedReportScheduler;
