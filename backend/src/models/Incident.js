const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    // ---------------------------------------------------------
    // BASIC INCIDENT INFORMATION
    // ---------------------------------------------------------

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    severity: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "investigating", "resolved"],
      default: "open",
      required: true,
    },

    source: {
      type: String,
      trim: true,
      default: "manual",
    },

    category: {
      type: String,
      enum: [
        "malware",
        "phishing",
        "unauthorized_access",
        "data_breach",
        "network_attack",
        "suspicious_activity",
        "other",
      ],
      default: "other",
    },

    affectedSystem: {
      type: String,
      trim: true,
      default: "",
    },

    // ---------------------------------------------------------
    // INDICATORS
    // ---------------------------------------------------------

    indicators: [
      {
        type: String,
        trim: true,
      },
    ],

    extractedIOCs: [
      {
        type: {
          type: String,
          trim: true,
        },

        value: {
          type: String,
          trim: true,
        },

        source: {
          type: String,
          trim: true,
          default: "incident",
        },
      },
    ],

    // ---------------------------------------------------------
    // USER / OWNERSHIP
    // ---------------------------------------------------------

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    // ---------------------------------------------------------
    // ACTIVITY TIMELINE
    // ---------------------------------------------------------

    activityTimeline: [
      {
        action: {
          type: String,
          required: true,
          trim: true,
        },

        description: {
          type: String,
          default: "",
          trim: true,
        },

        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },

        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ---------------------------------------------------------
    // THREAT INTELLIGENCE
    // ---------------------------------------------------------

    threatIntelligence: {
      status: {
        type: String,
        enum: [
          "not_started",
          "analyzing",
          "completed",
          "failed",
        ],
        default: "not_started",
      },

      lastAnalyzedAt: {
        type: Date,
        default: null,
      },

      summary: {
        total: {
          type: Number,
          default: 0,
        },

        malicious: {
          type: Number,
          default: 0,
        },

        suspicious: {
          type: Number,
          default: 0,
        },

        clean: {
          type: Number,
          default: 0,
        },

        unknown: {
          type: Number,
          default: 0,
        },
      },

      results: [
        {
          type: {
            type: String,
            trim: true,
          },

          value: {
            type: String,
            trim: true,
          },

          source: {
            type: String,
            trim: true,
          },

          threatIntel: {
            success: {
              type: Boolean,
              default: false,
            },

            type: {
              type: String,
              default: "",
            },

            value: {
              type: String,
              default: "",
            },

            malicious: {
              type: Number,
              default: 0,
            },

            suspicious: {
              type: Number,
              default: 0,
            },

            harmless: {
              type: Number,
              default: 0,
            },

            undetected: {
              type: Number,
              default: 0,
            },

            reputation: {
              type: Number,
              default: 0,
            },

            country: {
              type: String,
              default: null,
            },

            asOwner: {
              type: String,
              default: null,
            },

            network: {
              type: String,
              default: null,
            },

            registrar: {
              type: String,
              default: null,
            },

            creationDate: {
              type: Number,
              default: null,
            },

            lastAnalysisDate: {
              type: Number,
              default: null,
            },

            finalUrl: {
              type: String,
              default: null,
            },

            title: {
              type: String,
              default: null,
            },

            status: {
              type: String,
              default: null,
            },

            message: {
              type: String,
              default: null,
            },

            error: {
              type: String,
              default: null,
            },
          },
        },
      ],
    },

    // ---------------------------------------------------------
    // AI INVESTIGATION
    // ---------------------------------------------------------

    aiInvestigation: {
      status: {
        type: String,
        enum: [
          "not_started",
          "investigating",
          "completed",
          "failed",
        ],
        default: "not_started",
      },

      analysis: {
        type: String,
        default: "",
      },

      threatType: {
        type: String,
        default: "",
      },

      riskScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      keyFindings: [
        {
          type: String,
          trim: true,
        },
      ],

      recommendedActions: [
        {
          type: String,
          trim: true,
        },
      ],

      confidenceLevel: {
        type: String,
        default: "",
      },

      investigatedAt: {
        type: Date,
        default: null,
      },
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Incident",
  incidentSchema
);
