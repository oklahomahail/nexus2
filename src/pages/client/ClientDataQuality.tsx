/**
 * Client Data Quality Dashboard
 *
 * Displays data quality metrics including:
 * - Overall quality score and grade
 * - Duplicate donor detection
 * - Missing field analysis
 * - Outlier detection
 */

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";

import { useClient } from "@/context/ClientContext";
import { useDataQuality } from "@/hooks/useDataQuality";

export default function ClientDataQuality() {
  const { currentClient } = useClient();
  const { metrics, loading, error, refresh } = useDataQuality(
    currentClient?.id || "",
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-400">
            Analyzing data quality...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error Loading Data Quality
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error.message}
          </p>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-green-600 bg-green-50 border-green-200";
      case "B":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "C":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "D":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "F":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            High
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
            Medium
          </span>
        );
      case "low":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Data Quality
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {currentClient?.name || "Client"} - Quality Analysis
            </p>
          </div>
          <button
            onClick={refresh}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Quality Score Card */}
        <div
          className={`mb-6 p-6 rounded-xl border-2 ${getGradeColor(metrics.score.grade)}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">Overall Quality Score</h2>
                <span className="text-4xl font-bold">
                  {metrics.score.grade}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-3xl font-bold">
                  {metrics.score.score}
                  <span className="text-lg font-normal">/100</span>
                </div>
              </div>
              <div className="space-y-1">
                {metrics.score.deductions.map((deduction, idx) => (
                  <div key={idx} className="text-sm flex items-center gap-2">
                    <span className="font-medium">{deduction.points}</span>
                    <span>
                      {deduction.reason.replace(/_/g, " ")}
                      {deduction.count && ` (${deduction.count})`}
                      {deduction.percent &&
                        ` (${deduction.percent.toFixed(1)}%)`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {metrics.score.grade === "A" ? (
              <CheckCircle2 className="w-16 h-16" />
            ) : (
              <AlertTriangle className="w-16 h-16" />
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Duplicate Donors
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.duplicates.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Missing Fields
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    metrics.missingFields.filter((f) => f.missing_percent > 10)
                      .length
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Outliers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.outliers.reduce((sum, o) => sum + o.record_count, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Duplicate Donors */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Duplicate Donors
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {metrics.duplicates.length} potential duplicates found
              </p>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {metrics.duplicates.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No duplicates detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.duplicates.slice(0, 10).map((dup, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500 uppercase">
                          {dup.match_type.replace(/_/g, " ")}
                        </span>
                        <span className="text-xs text-gray-500">
                          {(dup.match_score * 100).toFixed(0)}% match
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        {dup.details.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{dup.details.email}</span>
                          </div>
                        )}
                        {dup.details.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{dup.details.phone}</span>
                          </div>
                        )}
                        {dup.details.name_1 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span>
                              {dup.details.name_1} / {dup.details.name_2}
                            </span>
                          </div>
                        )}
                        {dup.details.zip && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span>{dup.details.zip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {metrics.duplicates.length > 10 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      +{metrics.duplicates.length - 10} more duplicates
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Missing Fields */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Missing Fields
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Field completeness analysis
              </p>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {metrics.missingFields.map((field, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {field.table_name}.{field.field_name}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {field.missing_percent.toFixed(1)}% missing
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          field.missing_percent > 50
                            ? "bg-red-500"
                            : field.missing_percent > 25
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{
                          width: `${100 - field.missing_percent}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {field.missing_count} of {field.total_count} records
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Outliers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 lg:col-span-2">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Outliers & Anomalies
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Unusual data patterns detected
              </p>
            </div>
            <div className="p-4">
              {metrics.outliers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No outliers detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics.outliers.map((outlier, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {outlier.outlier_type
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                          {getSeverityBadge(outlier.severity)}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {outlier.record_count} records
                        </span>
                      </div>
                      {outlier.details.examples &&
                        outlier.details.examples.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {outlier.details.examples
                              .slice(0, 3)
                              .map((example, exIdx) => (
                                <div
                                  key={exIdx}
                                  className="text-xs text-gray-600 dark:text-gray-400"
                                >
                                  {example.amount && (
                                    <span>
                                      ${example.amount.toLocaleString()}
                                    </span>
                                  )}
                                  {example.date && (
                                    <span className="ml-2">{example.date}</span>
                                  )}
                                  {example.name && (
                                    <span className="ml-2">{example.name}</span>
                                  )}
                                </div>
                              ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
