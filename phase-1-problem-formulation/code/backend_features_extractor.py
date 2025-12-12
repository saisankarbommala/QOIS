# Phase 1 – Backend Features Extractor

from qiskit_ibm_runtime import QiskitRuntimeService
import json

def extract_backend_features():
    service = QiskitRuntimeService()
    data = []

    for backend in service.backends():
        status = backend.status()
        props = backend.properties()

        entry = {
            "name": backend.name,
            "queue_length": status.pending_jobs,
            "operational": status.operational,
            "num_qubits": backend.num_qubits,
            "error_rate": backend.properties().gate_errors[0] if props else None,
            "downtime_probability": 0.1,  # placeholder
        }
        data.append(entry)

    with open("backend_features.json", "w") as f:
        json.dump(data, f, indent=2)

extract_backend_features()
