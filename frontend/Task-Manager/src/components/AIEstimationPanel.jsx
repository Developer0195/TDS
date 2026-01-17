import React from "react";

const AIEstimationPanel = ({
  loading,
  estimation,
  onRun,
  onApplyDueDate,
  canEstimate,
}) => {
  return (
    <div className="border border-indigo-100 bg-indigo-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-indigo-700">
        🤖 AI Estimation (Advisory)
      </h4>

      <p className="text-xs text-slate-600 mt-1">
        Based on general task heuristics. Accuracy improves over time.
      </p>

      {!estimation && (
        <button
          disabled={!canEstimate || loading}
          onClick={onRun}
          className={`mt-3 text-xs font-medium ${
            !canEstimate || loading
              ? "text-gray-400 cursor-not-allowed"
              : "text-indigo-600 hover:underline"
          }`}
        >
          {loading ? "Estimating..." : "✨ Estimate Effort & Deadline"}
        </button>
      )}

      {estimation && (
        <div className="mt-3 space-y-2 text-xs text-slate-700">
          <p>
            ⏱ <strong>Estimated Effort:</strong>{" "}
            {estimation.estimatedHours}
          </p>

          <p>
            📅 <strong>Suggested Due Date:</strong>{" "}
            {estimation.suggestedDueDate}
          </p>

          <p>
            🎯 <strong>Confidence:</strong>{" "}
            {Math.round(estimation.confidence * 100)}%
          </p>

          <p className="text-slate-500">
            <strong>Why:</strong> {estimation.reasoning}
          </p>

          <button
            onClick={onApplyDueDate}
            className="mt-2 text-xs text-indigo-600 hover:underline"
          >
            Apply suggested due date
          </button>
        </div>
      )}
    </div>
  );
};

export default AIEstimationPanel;
