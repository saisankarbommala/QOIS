// services/jobWorker.js — FULLY UPDATED FOR IBM QUANTUM RUNTIME V2

import Job from "../models/Job.js";
import { getJobStatusFromIBM } from "./ibmService.js";
import { emitJobUpdate } from "../utils/socket.js";

const POLLING_INTERVAL = 10000;

function mapIBMStatus(status) {
  if (!status) return "failed";
  const s = status.toLowerCase();
  if (s.includes("queued")) return "queued";
  if (s.includes("running") || s.includes("executing")) return "running";
  if (s.includes("completed") || s.includes("finished")) return "completed";
  if (s.includes("failed") || s.includes("error")) return "failed";
  return "running";
}

function extractIBMResult(ibm) {
  const result = { raw: ibm };

  if (ibm?.state?.reason) {
    result.type = "error";
    result.error = ibm.state.reason;
    return result;
  }

  const pubResult = ibm?.results?.[0]; 
  if (!pubResult?.data) return result;

  const data = pubResult.data;

  // SamplerV2: Find register name containing samples (e.g., "c" or "meas") 
  const regName = Object.keys(data).find(key => data[key].samples || Array.isArray(data[key]));

  if (regName) {
    result.type = "sampler";
    const samples = data[regName].samples || data[regName]; 
    
    // Convert bitstring list to Counts for dashboard visualization 
    result.counts = samples.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    
    result.metadata = pubResult.metadata || {};
    return result;
  }

  return result;
}

const runJobWorker = async () => {
  try {
    const jobs = await Job.find({ status: { $in: ["queued", "running"] } });

    if (!jobs.length) return;

    for (const job of jobs) {
      if (!job.ibmJobId) {
        job.status = "failed";
        await job.save();
        emitJobUpdate("jobFailed", job);
        continue;
      }

      try {
        const ibm = await getJobStatusFromIBM(job.ibmJobId);
        const ibmStatus = ibm?.state?.status;
        if (!ibmStatus) continue;

        const mappedStatus = mapIBMStatus(ibmStatus);

        if (mappedStatus !== job.status) {
          job.status = mappedStatus;

          if (mappedStatus === "completed" || mappedStatus === "failed") {
            job.ibmResult = extractIBMResult(ibm);
            emitJobUpdate(mappedStatus === "completed" ? "jobCompleted" : "jobFailed", job);
          } else {
            emitJobUpdate("jobUpdated", job);
          }
          await job.save();
        }
      } catch (err) {
        job.status = "failed";
        job.ibmResult = { type: "error", message: err.message };
        await job.save();
        emitJobUpdate("jobFailed", job);
      }
    }
  } catch (err) {
    console.error("FATAL JOB WORKER ERROR:", err.message);
  }
};

export const startWorker = () => {
  setInterval(runJobWorker, POLLING_INTERVAL);
};