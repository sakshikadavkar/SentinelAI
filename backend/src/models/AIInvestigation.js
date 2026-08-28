const mongoose = require("mongoose");

const aiInvestigationSchema = new mongoose.Schema(
  {
    incident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Incident",
      required: true,
    },

    investigatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    threatType: {
      type: String,
      required: true,
      trim: true,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    threatAssessment: {
      type: String,
      required: true,
      trim: true,
    },

    keyFindings: [
      {
        type: String,
        trim: true,
      },
    ],

    recommendedResponse: [
      {
        type: String,
        trim: true,
      },
    ],

    rawResponse: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "AIInvestigation",
  aiInvestigationSchema
);