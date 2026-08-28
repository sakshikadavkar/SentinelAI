import { useEffect, useState } from "react";

import {
  AlertTriangle,
  Plus,
  RefreshCw,
  ShieldAlert,
  Trash2,
  X,
  BrainCircuit,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  ShieldCheck,
  ShieldX,
  Activity,
} from "lucide-react";

import {
  getIncidents,
  createIncident,
  updateIncident,
  deleteIncident,
} from "../../../services/incidentService";

import { investigateIncident } from "../../../services/aiService";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [investigating, setInvestigating] = useState(false);

  const [error, setError] = useState("");

  const [selectedIncident, setSelectedIncident] =
    useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "medium",
    category: "other",
    source: "manual",
    affectedSystem: "",
    indicators: "",
  });

  // =========================================================
  // LOAD INCIDENTS
  // =========================================================

  const loadIncidents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getIncidents();

      setIncidents(response.incidents || []);
    } catch (err) {
      console.error("Failed to load incidents:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load incidents."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  // =========================================================
  // FORM
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // CREATE INCIDENT
  // =========================================================

  const handleCreateIncident = async (event) => {
    event.preventDefault();

    try {
      setCreating(true);
      setError("");

      const incidentData = {
        title: form.title.trim(),

        description: form.description.trim(),

        severity: form.severity,

        category: form.category,

        source: form.source.trim(),

        affectedSystem:
          form.affectedSystem.trim(),

        indicators: form.indicators
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      };

      await createIncident(incidentData);

      setForm({
        title: "",
        description: "",
        severity: "medium",
        category: "other",
        source: "manual",
        affectedSystem: "",
        indicators: "",
      });

      await loadIncidents();
    } catch (err) {
      console.error(
        "Failed to create incident:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create incident."
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const handleStatusChange = async (
    incident,
    status
  ) => {
    try {
      setSaving(true);
      setError("");

      const response =
        await updateIncident(
          incident._id,
          { status }
        );

      setIncidents((previous) =>
        previous.map((item) =>
          item._id === incident._id
            ? response.incident
            : item
        )
      );

      setSelectedIncident(
        response.incident
      );
    } catch (err) {
      console.error(
        "Failed to update incident:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to update incident."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE INCIDENT
  // =========================================================

  const handleDeleteIncident = async (
    incident
  ) => {
    const confirmed =
      window.confirm(
        `Delete "${incident.title}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await deleteIncident(
        incident._id
      );

      setIncidents((previous) =>
        previous.filter(
          (item) =>
            item._id !== incident._id
        )
      );

      setSelectedIncident(null);
    } catch (err) {
      console.error(
        "Failed to delete incident:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete incident."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // AI INVESTIGATION
  // =========================================================

  const handleAIInvestigation = async () => {
    if (!selectedIncident?._id) {
      return;
    }

    try {
      setInvestigating(true);
      setError("");

      console.log(
        "🤖 Starting AI investigation:",
        selectedIncident._id
      );

      const response =
        await investigateIncident(
          selectedIncident._id
        );

      console.log(
        "✅ AI investigation response:",
        response
      );

      if (!response?.success) {
        throw new Error(
          response?.message ||
            "AI investigation failed."
        );
      }

      const aiInvestigation =
        response.aiInvestigation || {};

      const updatedIncident = {
        ...selectedIncident,

        extractedIOCs:
          response.extractedIOCs ||
          selectedIncident.extractedIOCs ||
          [],

        threatIntelligence:
          response.threatIntelligence ||
          selectedIncident.threatIntelligence ||
          {
            status: "not_started",
            summary: {
              total: 0,
              malicious: 0,
              suspicious: 0,
              clean: 0,
              unknown: 0,
            },
            results: [],
          },

        aiInvestigation: {
          status:
            aiInvestigation.status ||
            "completed",

          riskScore:
            aiInvestigation.riskScore ??
            null,

          threatType:
            aiInvestigation.threatType ||
            "",

          confidenceLevel:
            aiInvestigation.confidenceLevel ||
            aiInvestigation.confidence ||
            "",

          analysis:
            aiInvestigation.threatAssessment ||
            aiInvestigation.analysis ||
            "",

          keyFindings:
            Array.isArray(
              aiInvestigation.keyFindings
            )
              ? aiInvestigation.keyFindings
              : [],

          recommendedActions:
            Array.isArray(
              aiInvestigation.recommendedActions
            )
              ? aiInvestigation.recommendedActions
              : Array.isArray(
                  aiInvestigation.recommendedResponse
                )
              ? aiInvestigation.recommendedResponse
              : [],

          investigatedAt:
            aiInvestigation.investigatedAt ||
            new Date(),
        },

        activityTimeline:
          response.activityTimeline ||
          selectedIncident.activityTimeline ||
          [],
      };

      setSelectedIncident(
        updatedIncident
      );

      setIncidents((previous) =>
        previous.map((item) =>
          item._id ===
          selectedIncident._id
            ? updatedIncident
            : item
        )
      );
    } catch (err) {
      console.error(
        "❌ AI investigation failed:",
        err
      );

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "Unable to complete AI investigation."
      );
    } finally {
      setInvestigating(false);
    }
  };

  // =========================================================
  // UI HELPERS
  // =========================================================

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 text-red-400 border-red-500/30";

      case "high":
        return "bg-orange-500/10 text-orange-400 border-orange-500/30";

      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";

      case "low":
        return "bg-green-500/10 text-green-400 border-green-500/30";

      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/30";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "resolved":
        return "text-green-400";

      case "investigating":
        return "text-cyan-400";

      default:
        return "text-yellow-400";
    }
  };

  const getRiskClass = (score) => {
    if (score >= 80) {
      return "text-red-400";
    }

    if (score >= 60) {
      return "text-orange-400";
    }

    if (score >= 40) {
      return "text-yellow-400";
    }

    return "text-green-400";
  };

  const getConfidenceClass = (
    confidence
  ) => {
    switch (confidence) {
      case "High":
        return "text-green-400";

      case "Medium":
        return "text-yellow-400";

      case "Low":
        return "text-red-400";

      default:
        return "text-slate-400";
    }
  };

  const getIOCClass = (type) => {
    switch (type) {
      case "ipv4":
      case "ipv6":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";

      case "domain":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";

      case "url":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";

      case "email":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      case "md5":
      case "sha1":
      case "sha256":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      default:
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
    }
  };

  const getThreatResultClass = (
    result
  ) => {
    const malicious =
      result?.threatIntel?.malicious || 0;

    const suspicious =
      result?.threatIntel?.suspicious || 0;

    if (malicious > 0) {
      return "border-red-500/30 bg-red-500/5";
    }

    if (suspicious > 0) {
      return "border-orange-500/30 bg-orange-500/5";
    }

    return "border-green-500/20 bg-green-500/5";
  };

  const getThreatStatus = (result) => {
    const malicious =
      result?.threatIntel?.malicious || 0;

    const suspicious =
      result?.threatIntel?.suspicious || 0;

    if (malicious > 0) {
      return {
        label: "Malicious",
        className:
          "text-red-400 bg-red-500/10 border-red-500/20",
        icon: ShieldX,
      };
    }

    if (suspicious > 0) {
      return {
        label: "Suspicious",
        className:
          "text-orange-400 bg-orange-500/10 border-orange-500/20",
        icon: AlertTriangle,
      };
    }

    if (
      result?.threatIntel?.success &&
      result?.threatIntel?.harmless > 0
    ) {
      return {
        label: "Clean",
        className:
          "text-green-400 bg-green-500/10 border-green-500/20",
        icon: ShieldCheck,
      };
    }

    return {
      label: "Unknown",
      className:
        "text-slate-400 bg-slate-500/10 border-slate-500/20",
      icon: Activity,
    };
  };

  // =========================================================
  // AI RESULT
  // =========================================================

  const aiResult =
    selectedIncident?.aiInvestigation;

  const hasAIResult =
    Boolean(
      aiResult &&
        (
          aiResult.riskScore !== null &&
          aiResult.riskScore !== undefined ||
          aiResult.threatType ||
          aiResult.confidenceLevel ||
          aiResult.analysis ||
          aiResult.keyFindings?.length ||
          aiResult.recommendedActions?.length
        )
    );

  // =========================================================
  // THREAT INTELLIGENCE
  // =========================================================

  const threatIntel =
    selectedIncident?.threatIntelligence;

  const threatSummary =
    threatIntel?.summary || {
      total: 0,
      malicious: 0,
      suspicious: 0,
      clean: 0,
      unknown: 0,
    };

  const threatResults =
    Array.isArray(
      threatIntel?.results
    )
      ? threatIntel.results
      : [];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>

          <div className="flex items-center gap-3">

            <ShieldAlert
              className="text-cyan-400"
              size={32}
            />

            <h1 className="text-3xl font-bold text-white">
              Incident Management
            </h1>

          </div>

          <p className="text-slate-400 mt-2">
            Monitor, investigate and manage security incidents.
          </p>

        </div>

        <button
          type="button"
          onClick={loadIncidents}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-3 transition disabled:opacity-50"
        >

          <RefreshCw
            size={18}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh

        </button>

      </div>

      {/* ERROR */}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 flex items-start gap-3">

          <AlertCircle
            size={20}
            className="shrink-0 mt-0.5"
          />

          <span>{error}</span>

        </div>
      )}

      {/* =====================================================
          CREATE INCIDENT
          ===================================================== */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <div className="flex items-center gap-3 mb-6">

          <Plus
            className="text-cyan-400"
            size={22}
          />

          <h2 className="text-xl font-semibold text-white">
            Create Security Incident
          </h2>

        </div>

        <form
          onSubmit={
            handleCreateIncident
          }
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >

          <div className="md:col-span-2">

            <label className="block text-sm text-slate-300 mb-2">
              Incident Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Example: Suspicious login detected"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

          </div>

          <div className="md:col-span-2">

            <label className="block text-sm text-slate-300 mb-2">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe what happened..."
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-400 resize-none"
            />

          </div>

          <div>

            <label className="block text-sm text-slate-300 mb-2">
              Severity
            </label>

            <select
              name="severity"
              value={form.severity}
              onChange={handleChange}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-400"
            >

              <option value="critical">
                Critical
              </option>

              <option value="high">
                High
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="low">
                Low
              </option>

            </select>

          </div>

          <div>

            <label className="block text-sm text-slate-300 mb-2">
              Category
            </label>

            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-400"
            >

              <option value="malware">
                Malware
              </option>

              <option value="phishing">
                Phishing
              </option>

              <option value="unauthorized_access">
                Unauthorized Access
              </option>

              <option value="data_breach">
                Data Breach
              </option>

              <option value="network_attack">
                Network Attack
              </option>

              <option value="suspicious_activity">
                Suspicious Activity
              </option>

              <option value="other">
                Other
              </option>

            </select>

          </div>

          <div>

            <label className="block text-sm text-slate-300 mb-2">
              Source
            </label>

            <input
              name="source"
              value={form.source}
              onChange={handleChange}
              placeholder="manual / SIEM / IDS / API"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

          </div>

          <div>

            <label className="block text-sm text-slate-300 mb-2">
              Affected System
            </label>

            <input
              name="affectedSystem"
              value={
                form.affectedSystem
              }
              onChange={handleChange}
              placeholder="Server / workstation / application"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

          </div>

          <div className="md:col-span-2">

            <label className="block text-sm text-slate-300 mb-2">
              Indicators
            </label>

            <input
              name="indicators"
              value={form.indicators}
              onChange={handleChange}
              placeholder="IP, domain, URL, hash... separated by commas"
              className="w-full rounded-xl bg-slate-800 border border-slate-700 px-4 py-3 text-white outline-none focus:border-cyan-400"
            />

            <p className="text-xs text-slate-600 mt-2">
              Separate multiple indicators with commas.
            </p>

          </div>

          <div className="md:col-span-2 flex justify-end">

            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-6 py-3 transition disabled:opacity-50"
            >

              {creating ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Creating...
                </>
              ) : (
                <>
                  <AlertTriangle
                    size={18}
                  />

                  Create Incident
                </>
              )}

            </button>

          </div>

        </form>

      </div>

      {/* =====================================================
          INCIDENT LIST
          ===================================================== */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

        <div className="px-6 py-5 border-b border-slate-800">

          <h2 className="text-xl font-semibold text-white">
            Security Incidents
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            {incidents.length} incident
            {incidents.length !== 1
              ? "s"
              : ""}{" "}
            recorded
          </p>

        </div>

        {loading ? (

          <div className="p-10 text-center text-slate-400">

            <Loader2
              size={24}
              className="animate-spin mx-auto mb-3"
            />

            Loading incidents...

          </div>

        ) : incidents.length === 0 ? (

          <div className="p-12 text-center">

            <ShieldAlert
              size={48}
              className="mx-auto text-slate-700"
            />

            <h3 className="text-white font-semibold mt-4">
              No incidents yet
            </h3>

            <p className="text-slate-500 mt-2">
              Create your first security incident above.
            </p>

          </div>

        ) : (

          <div className="divide-y divide-slate-800">

            {incidents.map(
              (incident) => (

                <div
                  key={incident._id}
                  className="p-6 hover:bg-slate-800/40 transition"
                >

                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-3">

                        <h3 className="text-lg font-semibold text-white">
                          {incident.title}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-semibold uppercase ${getSeverityClass(
                            incident.severity
                          )}`}
                        >
                          {incident.severity}
                        </span>

                        {incident.threatIntelligence
                          ?.summary
                          ?.malicious >
                          0 && (

                          <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">

                            Threat Detected

                          </span>

                        )}

                        {incident.extractedIOCs
                          ?.length >
                          0 && (

                          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">

                            {
                              incident
                                .extractedIOCs
                                .length
                            }{" "}
                            IOC
                            {incident
                              .extractedIOCs
                              .length !== 1
                              ? "s"
                              : ""}

                          </span>

                        )}

                      </div>

                      <p className="text-slate-400 mt-2">
                        {incident.description}
                      </p>

                      <div className="flex flex-wrap gap-4 mt-4 text-xs">

                        <span
                          className={`font-semibold uppercase ${getStatusClass(
                            incident.status
                          )}`}
                        >
                          ●{" "}
                          {incident.status}
                        </span>

                        <span className="text-slate-500">
                          Category:{" "}
                          {incident.category.replaceAll(
                            "_",
                            " "
                          )}
                        </span>

                        <span className="text-slate-500">
                          Source:{" "}
                          {incident.source}
                        </span>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedIncident(
                          incident
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-lg bg-slate-800 hover:bg-cyan-500/10 hover:text-cyan-400 text-slate-300 px-4 py-2 transition shrink-0"
                    >
                      View Details
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* =====================================================
          DETAILS MODAL
          ===================================================== */}

      {selectedIncident && (

        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">

          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-start justify-between gap-4 p-6 border-b border-slate-800">

              <div>

                <p className="text-xs uppercase tracking-wider text-cyan-400 font-semibold">
                  Security Incident
                </p>

                <h2 className="text-2xl font-bold text-white mt-2">
                  {selectedIncident.title}
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedIncident(
                    null
                  )
                }
                className="text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>

            </div>

            <div className="p-6 space-y-6">

              {/* DESCRIPTION */}

              <div>

                <p className="text-sm text-slate-500">
                  Description
                </p>

                <p className="text-slate-200 mt-2 leading-7">
                  {
                    selectedIncident.description
                  }
                </p>

              </div>

              {/* METADATA */}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                <div className="bg-slate-900 rounded-xl p-4">

                  <p className="text-xs text-slate-500">
                    Severity
                  </p>

                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase ${getSeverityClass(
                      selectedIncident.severity
                    )}`}
                  >
                    {
                      selectedIncident.severity
                    }
                  </span>

                </div>

                <div className="bg-slate-900 rounded-xl p-4">

                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <select
                    value={
                      selectedIncident.status
                    }
                    disabled={saving}
                    onChange={(event) =>
                      handleStatusChange(
                        selectedIncident,
                        event.target.value
                      )
                    }
                    className="mt-2 w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-white outline-none focus:border-cyan-400"
                  >

                    <option value="open">
                      Open
                    </option>

                    <option value="investigating">
                      Investigating
                    </option>

                    <option value="resolved">
                      Resolved
                    </option>

                  </select>

                </div>

                <div className="bg-slate-900 rounded-xl p-4">

                  <p className="text-xs text-slate-500">
                    Category
                  </p>

                  <p className="text-white mt-2 capitalize">
                    {
                      selectedIncident.category.replaceAll(
                        "_",
                        " "
                      )
                    }
                  </p>

                </div>

                <div className="bg-slate-900 rounded-xl p-4">

                  <p className="text-xs text-slate-500">
                    Source
                  </p>

                  <p className="text-white mt-2">
                    {
                      selectedIncident.source
                    }
                  </p>

                </div>

                <div className="bg-slate-900 rounded-xl p-4">

                  <p className="text-xs text-slate-500">
                    Affected System
                  </p>

                  <p className="text-white mt-2">
                    {
                      selectedIncident.affectedSystem ||
                      "Not specified"
                    }
                  </p>

                </div>

                <div className="bg-slate-900 rounded-xl p-4">

                  <p className="text-xs text-slate-500">
                    Created
                  </p>

                  <p className="text-white mt-2">
                    {selectedIncident.createdAt
                      ? new Date(
                          selectedIncident.createdAt
                        ).toLocaleString()
                      : "Unknown"}
                  </p>

                </div>

              </div>

              {/* =====================================================
                  IOC SECTION
                  ===================================================== */}

              <div className="pt-4 border-t border-slate-800">

                <div className="flex items-center justify-between">

                  <div>

                    <div className="flex items-center gap-3">

                      <Search
                        size={22}
                        className="text-cyan-400"
                      />

                      <h3 className="text-xl font-semibold text-white">
                        Indicators of Compromise
                      </h3>

                    </div>

                    <p className="text-sm text-slate-500 mt-2">
                      Automatically detected indicators associated with this incident.
                    </p>

                  </div>

                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">

                    {selectedIncident
                      .extractedIOCs
                      ?.length || 0}{" "}
                    detected

                  </span>

                </div>

                {selectedIncident
                  .extractedIOCs
                  ?.length > 0 ? (

                  <div className="mt-5 space-y-3">

                    {selectedIncident.extractedIOCs.map(
                      (ioc, index) => (

                        <div
                          key={`${ioc.type}-${ioc.value}-${index}`}
                          className="rounded-xl bg-slate-900 border border-slate-800 p-4"
                        >

                          <div className="flex items-center gap-3">

                            <span
                              className={`px-2.5 py-1 rounded-md border text-xs font-semibold uppercase ${getIOCClass(
                                ioc.type
                              )}`}
                            >
                              {
                                ioc.type
                              }
                            </span>

                            <span className="text-xs text-slate-600">
                              Source:{" "}
                              {
                                ioc.source ||
                                "unknown"
                              }
                            </span>

                          </div>

                          <p className="text-slate-200 font-mono text-sm mt-3 break-all">
                            {
                              ioc.value
                            }
                          </p>

                        </div>

                      )
                    )}

                  </div>

                ) : (

                  <div className="mt-5 rounded-xl bg-slate-900 border border-slate-800 p-5">

                    <p className="text-slate-600 text-sm">
                      No IOCs automatically detected.
                    </p>

                  </div>

                )}

              </div>

              {/* =====================================================
                  THREAT INTELLIGENCE
                  ===================================================== */}

              <div className="pt-4 border-t border-slate-800">

                <div className="flex items-center gap-3">

                  <ShieldCheck
                    size={24}
                    className="text-cyan-400"
                  />

                  <div>

                    <h3 className="text-xl font-semibold text-white">
                      Threat Intelligence
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      VirusTotal analysis of detected indicators.
                    </p>

                  </div>

                </div>

                {/* SUMMARY */}

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">

                  <div className="bg-slate-900 rounded-xl p-4">

                    <p className="text-xs text-slate-500">
                      Total
                    </p>

                    <p className="text-2xl font-bold text-white mt-2">
                      {
                        threatSummary.total
                      }
                    </p>

                  </div>

                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">

                    <p className="text-xs text-red-400">
                      Malicious
                    </p>

                    <p className="text-2xl font-bold text-red-400 mt-2">
                      {
                        threatSummary.malicious
                      }
                    </p>

                  </div>

                  <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">

                    <p className="text-xs text-orange-400">
                      Suspicious
                    </p>

                    <p className="text-2xl font-bold text-orange-400 mt-2">
                      {
                        threatSummary.suspicious
                      }
                    </p>

                  </div>

                  <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">

                    <p className="text-xs text-green-400">
                      Clean
                    </p>

                    <p className="text-2xl font-bold text-green-400 mt-2">
                      {
                        threatSummary.clean
                      }
                    </p>

                  </div>

                  <div className="bg-slate-900 rounded-xl p-4">

                    <p className="text-xs text-slate-500">
                      Unknown
                    </p>

                    <p className="text-2xl font-bold text-slate-400 mt-2">
                      {
                        threatSummary.unknown
                      }
                    </p>

                  </div>

                </div>

                {/* STATUS */}

                <div className="mt-5">

                  {threatIntel?.status ===
                  "completed" ? (

                    <div className="flex items-center gap-2 text-sm text-green-400">

                      <CheckCircle2
                        size={18}
                      />

                      Threat intelligence analysis completed.

                    </div>

                  ) : threatIntel?.status ===
                    "failed" ? (

                    <div className="flex items-center gap-2 text-sm text-red-400">

                      <ShieldX
                        size={18}
                      />

                      Threat intelligence analysis failed.

                    </div>

                  ) : (

                    <p className="text-sm text-slate-500">
                      Run an AI investigation to analyze the indicators.
                    </p>

                  )}

                </div>

                {/* RESULTS */}

                {threatResults.length >
                  0 && (

                  <div className="mt-5 space-y-4">

                    {threatResults.map(
                      (
                        result,
                        index
                      ) => {

                        const threatStatus =
                          getThreatStatus(
                            result
                          );

                        const StatusIcon =
                          threatStatus.icon;

                        return (

                          <div
                            key={`${result.type}-${result.value}-${index}`}
                            className={`rounded-xl border p-5 ${getThreatResultClass(
                              result
                            )}`}
                          >

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">

                              <div>

                                <div className="flex flex-wrap items-center gap-3">

                                  <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-cyan-400 font-semibold uppercase">
                                    {
                                      result.type
                                    }
                                  </span>

                                  <span
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${threatStatus.className}`}
                                  >

                                    <StatusIcon
                                      size={14}
                                    />

                                    {
                                      threatStatus.label
                                    }

                                  </span>

                                </div>

                                <p className="font-mono text-sm text-slate-200 mt-3 break-all">
                                  {
                                    result.value
                                  }
                                </p>

                              </div>

                            </div>

                            {/* VT STATS */}

                            {result.threatIntel && (

                              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">

                                <div className="bg-slate-950/50 rounded-lg p-3">

                                  <p className="text-xs text-slate-500">
                                    Malicious
                                  </p>

                                  <p className="text-lg font-bold text-red-400 mt-1">
                                    {
                                      result
                                        .threatIntel
                                        .malicious ??
                                      0
                                    }
                                  </p>

                                </div>

                                <div className="bg-slate-950/50 rounded-lg p-3">

                                  <p className="text-xs text-slate-500">
                                    Suspicious
                                  </p>

                                  <p className="text-lg font-bold text-orange-400 mt-1">
                                    {
                                      result
                                        .threatIntel
                                        .suspicious ??
                                      0
                                    }
                                  </p>

                                </div>

                                <div className="bg-slate-950/50 rounded-lg p-3">

                                  <p className="text-xs text-slate-500">
                                    Harmless
                                  </p>

                                  <p className="text-lg font-bold text-green-400 mt-1">
                                    {
                                      result
                                        .threatIntel
                                        .harmless ??
                                      0
                                    }
                                  </p>

                                </div>

                                <div className="bg-slate-950/50 rounded-lg p-3">

                                  <p className="text-xs text-slate-500">
                                    Undetected
                                  </p>

                                  <p className="text-lg font-bold text-slate-400 mt-1">
                                    {
                                      result
                                        .threatIntel
                                        .undetected ??
                                      0
                                    }
                                  </p>

                                </div>

                                <div className="bg-slate-950/50 rounded-lg p-3">

                                  <p className="text-xs text-slate-500">
                                    Reputation
                                  </p>

                                  <p className="text-lg font-bold text-cyan-400 mt-1">
                                    {
                                      result
                                        .threatIntel
                                        .reputation ??
                                      0
                                    }
                                  </p>

                                </div>

                              </div>

                            )}

                            {/* EXTRA INFORMATION */}

                            {result.threatIntel && (

                              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">

                                {result
                                  .threatIntel
                                  .country && (

                                  <div className="text-slate-400">

                                    <span className="text-slate-600">
                                      Country:
                                    </span>{" "}

                                    {
                                      result
                                        .threatIntel
                                        .country
                                    }

                                  </div>

                                )}

                                {result
                                  .threatIntel
                                  .asOwner && (

                                  <div className="text-slate-400">

                                    <span className="text-slate-600">
                                      AS Owner:
                                    </span>{" "}

                                    {
                                      result
                                        .threatIntel
                                        .asOwner
                                    }

                                  </div>

                                )}

                                {result
                                  .threatIntel
                                  .network && (

                                  <div className="text-slate-400">

                                    <span className="text-slate-600">
                                      Network:
                                    </span>{" "}

                                    {
                                      result
                                        .threatIntel
                                        .network
                                    }

                                  </div>

                                )}

                                {result
                                  .threatIntel
                                  .registrar && (

                                  <div className="text-slate-400">

                                    <span className="text-slate-600">
                                      Registrar:
                                    </span>{" "}

                                    {
                                      result
                                        .threatIntel
                                        .registrar
                                    }

                                  </div>

                                )}

                              </div>

                            )}

                          </div>

                        );
                      }
                    )}

                  </div>

                )}

              </div>

              {/* =====================================================
                  AI INVESTIGATION
                  ===================================================== */}

              <div className="pt-4 border-t border-slate-800">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div>

                    <div className="flex items-center gap-3">

                      <BrainCircuit
                        size={24}
                        className="text-cyan-400"
                      />

                      <h3 className="text-xl font-semibold text-white">
                        AI Investigation
                      </h3>

                    </div>

                    <p className="text-sm text-slate-500 mt-2">
                      Analyze this security incident using SentinelAI.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleAIInvestigation
                    }
                    disabled={
                      investigating
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-5 py-3 transition disabled:opacity-50"
                  >

                    {investigating ? (
                      <>
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Investigating...
                      </>
                    ) : (
                      <>
                        <BrainCircuit
                          size={18}
                        />

                        Run AI Investigation
                      </>
                    )}

                  </button>

                </div>

              </div>

              {/* INVESTIGATING */}

              {investigating && (

                <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">

                  <div className="flex items-center gap-3">

                    <Loader2
                      size={22}
                      className="text-cyan-400 animate-spin"
                    />

                    <div>

                      <p className="text-white font-semibold">
                        SentinelAI is investigating the incident...
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        VirusTotal and Gemini are analyzing the detected indicators.
                      </p>

                    </div>

                  </div>

                </div>

              )}

              {/* AI RESULTS */}

              {hasAIResult &&
                !investigating && (

                  <div className="space-y-5">

                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">

                      <div className="flex items-center gap-3">

                        <CheckCircle2
                          size={22}
                          className="text-green-400"
                        />

                        <div>

                          <h3 className="text-lg font-semibold text-white">
                            AI Investigation Completed
                          </h3>

                          <p className="text-sm text-slate-500 mt-1">
                            Gemini analyzed the incident successfully.
                          </p>

                        </div>

                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

                        <p className="text-sm text-slate-500">
                          Risk Score
                        </p>

                        <div className="flex items-end gap-2 mt-2">

                          <span
                            className={`text-4xl font-bold ${getRiskClass(
                              Number(
                                aiResult.riskScore ||
                                  0
                              )
                            )}`}
                          >
                            {
                              aiResult.riskScore ??
                              "N/A"
                            }
                          </span>

                          <span className="text-slate-500 mb-1">
                            / 100
                          </span>

                        </div>

                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

                        <p className="text-sm text-slate-500">
                          Threat Type
                        </p>

                        <p className="text-white font-semibold mt-3">
                          {
                            aiResult.threatType ||
                            "Unknown"
                          }
                        </p>

                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

                        <p className="text-sm text-slate-500">
                          Confidence
                        </p>

                        <p
                          className={`font-semibold mt-3 ${getConfidenceClass(
                            aiResult.confidenceLevel
                          )}`}
                        >
                          {
                            aiResult.confidenceLevel ||
                            "Unknown"
                          }
                        </p>

                      </div>

                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

                      <div className="flex items-center gap-2 mb-3">

                        <ShieldAlert
                          size={20}
                          className="text-cyan-400"
                        />

                        <h4 className="font-semibold text-white">
                          Threat Assessment
                        </h4>

                      </div>

                      <p className="text-slate-300 leading-7">
                        {
                          aiResult.analysis ||
                          "No assessment available."
                        }
                      </p>

                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

                      <h4 className="font-semibold text-white mb-4">
                        Key Findings
                      </h4>

                      {aiResult.keyFindings?.length >
                      0 ? (

                        <div className="space-y-3">

                          {aiResult.keyFindings.map(
                            (
                              finding,
                              index
                            ) => (

                              <div
                                key={index}
                                className="flex gap-3"
                              >

                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold shrink-0">
                                  {
                                    index + 1
                                  }
                                </span>

                                <p className="text-slate-300 leading-6">
                                  {
                                    finding
                                  }
                                </p>

                              </div>

                            )
                          )}

                        </div>

                      ) : (

                        <p className="text-slate-600">
                          No findings available.
                        </p>

                      )}

                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

                      <h4 className="font-semibold text-white mb-4">
                        Recommended Response
                      </h4>

                      {aiResult.recommendedActions?.length >
                      0 ? (

                        <div className="space-y-3">

                          {aiResult.recommendedActions.map(
                            (
                              action,
                              index
                            ) => (

                              <div
                                key={index}
                                className="flex gap-3"
                              >

                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold shrink-0">
                                  {
                                    index + 1
                                  }
                                </span>

                                <p className="text-slate-300 leading-6">
                                  {
                                    action
                                  }
                                </p>

                              </div>

                            )
                          )}

                        </div>

                      ) : (

                        <p className="text-slate-600">
                          No recommended actions available.
                        </p>

                      )}

                    </div>

                    {aiResult.investigatedAt && (

                      <div className="text-xs text-slate-600 text-right">

                        Investigated:{" "}

                        {new Date(
                          aiResult.investigatedAt
                        ).toLocaleString()}

                      </div>

                    )}

                  </div>

                )}

              {/* ACTIONS */}

              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3 sm:justify-between">

                <button
                  type="button"
                  disabled={saving}
                  onClick={() =>
                    handleDeleteIncident(
                      selectedIncident
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-5 py-3 transition disabled:opacity-50"
                >

                  <Trash2
                    size={18}
                  />

                  Delete Incident

                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedIncident(
                      null
                    )
                  }
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-5 py-3 transition"
                >

                  <X size={18} />

                  Close

                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}