// controllers/jobController.js
// FULLY UPDATED FOR IBM QUANTUM RUNTIME PRIMITIVES V2

import Job from "../models/Job.js";
import { submitJob, getBackends } from "../services/ibmService.js";
import { emitJobUpdate } from "../utils/socket.js";
import ErrorResponse from "../utils/ErrorResponse.js";
import asyncHandler from "../middleware/asyncHandler.js";

/**
 * Basic QASM parser to estimate qubits and depth
 */
const circuitParser = (rawQASM) => {
  if (!rawQASM || typeof rawQASM !== "string") {
    return { qubits: 0, depth: 0 };
  }

  const qubitMatch = rawQASM.match(/(?:qubit|qreg)\s*.*\[(\d+)\]/);
  const qubits = qubitMatch ? Number(qubitMatch[1]) : 0;

  const lines = rawQASM
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const gateLines = lines.filter(
    (l) =>
      !l.startsWith("OPENQASM") &&
      !l.startsWith("include") &&
      !l.startsWith("//")
  );

  return {
    qubits,
    depth: Math.max(1, gateLines.length),
  };
};

/**
 * Create a new job (DB only)
 */
export const createJob = asyncHandler(async (req, res) => {
  const {
    name,
    backend,
    circuitType,
    shots,
    rawQASM,
    notes,
    algorithm,
    oracleType,
    runMode,
  } = req.body;

  if (!name || !backend || !circuitType || !rawQASM) {
    throw new ErrorResponse("All required fields must be provided.", 400);
  }

  const { qubits, depth } = circuitParser(rawQASM);

  const job = await Job.create({
    user: req.user.id,
    name,
    backend,
    circuitType: circuitType.toLowerCase(),
    shots: shots || 1024,
    rawQASM,
    notes: notes || "",
    algorithm: algorithm || "General",
    oracleType: oracleType || "None",
    runMode: runMode || "hardware",
    qubits,
    depth,
    status: "pending",
  });

  emitJobUpdate("jobCreated", job);

  res.status(201).json({
    success: true,
    data: job,
  });
});

/**
 * Submit job to IBM Quantum (Primitives V2 ONLY)
 */
export const submitJobToIBM = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job || job.status !== "pending") {
    throw new ErrorResponse("Invalid job status.", 400);
  }

  // Ensure stdgates for QASM 3.0
  let finalQASM = job.rawQASM.trim();
  if (
    finalQASM.includes("OPENQASM 3.0") &&
    !finalQASM.includes("stdgates.inc")
  ) {
    finalQASM = finalQASM.replace(
      "OPENQASM 3.0;",
      'OPENQASM 3.0;\ninclude "stdgates.inc";'
    );
  }

  /**
   * ✅ CORRECT IBM RUNTIME PRIMITIVES V2 PAYLOAD
   * ❌ No params
   * ❌ No pubs
   * ❌ No version field
   */
  const ibmPayload = {
    program_id: job.circuitType.includes("sampler")
      ? "sampler"
      : "estimator",
    backend: job.backend,
    run_mode: job.runMode || "hardware",
    inputs: {
      circuits: [finalQASM],
      shots: job.shots || 1024,
    },
  };

  try {
    const ibmResponse = await submitJob(ibmPayload);

    job.ibmJobId = ibmResponse.id;
    job.status = "queued";
    await job.save();

    emitJobUpdate("jobUpdated", job);

    res.status(200).json({
      success: true,
      data: job,
    });
  } catch (err) {
    const errorMsg =
      err.response?.data?.errors?.[0]?.message ||
      err.response?.data?.message ||
      "IBM Quantum rejected the job submission.";

    throw new ErrorResponse(errorMsg, 502);
  }
});

/**
 * Get all jobs (admin = all, user = own)
 */
export const getJobs = asyncHandler(async (req, res) => {
  const query =
    req.user.role === "admin"
      ? Job.find().populate("user", "name email")
      : Job.find({ user: req.user.id });

  const jobs = await query.sort("-createdAt");

  res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs,
  });
});

/**
 * Get single job
 */
export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!job) {
    throw new ErrorResponse("Job not found.", 404);
  }

  res.status(200).json({
    success: true,
    data: job,
  });
});

/**
 * Get available IBM backends
 */
export const getBackendsList = asyncHandler(async (req, res) => {
  const backends = await getBackends();
  const deviceList = backends?.devices || backends;

  res.status(200).json({
    success: true,
    data: { devices: deviceList },
  });
});

/**
 * Get job status
 */
export const getJobStatus = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new ErrorResponse("Job not found.", 404);
  }

  res.status(200).json({
    success: true,
    status: job.status,
  });
});

/**
 * Get job results
 */
export const getJobResults = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job || job.status !== "completed") {
    throw new ErrorResponse("Results not available.", 400);
  }

  res.status(200).json({
    success: true,
    results: job.ibmResult,
  });
});
