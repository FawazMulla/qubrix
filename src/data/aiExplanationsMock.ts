export interface AIExplanation {
  id: string;
  topic: string;
  title: string;
  category: "Fundamentals" | "Gates" | "Circuits" | "Algorithms" | "Simulation";
  level: "Beginner" | "Intermediate" | "Advanced";
  summary: string;
  analogy: {
    title: string;
    text: string;
  };
  mathematics: {
    formula: string;
    explanation: string;
  };
  circuitDiagram?: string[];
  qiskitCode: string;
  pitfalls: string[];
  suggestedQuestions: string[];
}

export const aiExplanationsDatabase: Record<string, AIExplanation> = {
  "superposition": {
    id: "superposition",
    topic: "Superposition",
    title: "Understanding Quantum Superposition",
    category: "Fundamentals",
    level: "Beginner",
    summary: "Superposition allows a quantum system to exist in a linear combination of basis states (|0⟩ and |1⟩) simultaneously, parameterized by complex probability amplitudes.",
    analogy: {
      title: "The Spinning Coin",
      text: "A coin resting on a table is either definitely Heads (0) or Tails (1). While spinning in mid-air, it exists in a blur of both possibilities at once. It only commits to Heads or Tails the instant you slap it down onto the table (measurement)."
    },
    mathematics: {
      formula: "|ψ⟩ = α|0⟩ + β|1⟩  where  |α|² + |β|² = 1",
      explanation: "α and β are complex amplitudes. The probability of measuring state |0⟩ is P(0) = |α|², and measuring |1⟩ is P(1) = |β|²."
    },
    circuitDiagram: [
      "q0: |0⟩ ───[ H ]─── |+⟩ = (|0⟩ + |1⟩)/√2"
    ],
    qiskitCode: `from qiskit import QuantumCircuit, Aer, execute

# 1-qubit superposition circuit
qc = QuantumCircuit(1, 1)
qc.h(0)            # Apply Hadamard gate
qc.measure(0, 0)   # Measure in computational basis

backend = Aer.get_backend('qasm_simulator')
job = execute(qc, backend, shots=1024)
print(job.result().get_counts()) # Output: ~50% '0', ~50% '1'`,
    pitfalls: [
      "Superposition is NOT 'the qubit is secretly 0 or 1 and we just don't know it yet' (hidden variable).",
      "Measurement destroys the superposition and collapses the state irreversibly."
    ],
    suggestedQuestions: [
      "Why does measurement collapse superposition?",
      "How does the Hadamard gate create superposition mathematically?",
      "Can we measure phase without collapsing the state?"
    ]
  },
  "hadamard-gate": {
    id: "hadamard-gate",
    topic: "Hadamard Gate (H)",
    title: "The Hadamard Gate: Gateway to Superposition",
    category: "Gates",
    level: "Beginner",
    summary: "The Hadamard gate (H) is a single-qubit unitary operation that maps computational basis states |0⟩ and |1⟩ into equal superposition states |+⟩ and |-⟩.",
    analogy: {
      title: "The Beam Splitter",
      text: "Imagine a 50/50 semi-silvered optical mirror. A single photon entering path A has an equal 50% chance of being reflected or transmitted, creating a coherent superposition of paths."
    },
    mathematics: {
      formula: "H = 1/√2 * [[1,  1], [1, -1]]\nH|0⟩ = (|0⟩ + |1⟩)/√2 = |+⟩\nH|1⟩ = (|0⟩ - |1⟩)/√2 = |-⟩",
      explanation: "Applying H twice returns the qubit to its original state (H · H = I), demonstrating quantum reversibility."
    },
    circuitDiagram: [
      "q0: |0⟩ ───[ H ]─── |+⟩",
      "q0: |+⟩ ───[ H ]─── |0⟩"
    ],
    qiskitCode: `from qiskit import QuantumCircuit

qc = QuantumCircuit(1)
qc.h(0) # Transform |0⟩ into |+⟩
qc.draw(output='text')`,
    pitfalls: [
      "Applying H to |1⟩ results in (|0⟩ - |1⟩)/√2 which has a relative phase of π (minus sign).",
      "H is self-inverse: H * H = Identity matrix."
    ],
    suggestedQuestions: [
      "What is the difference between |+⟩ and |-⟩ states?",
      "How does H rotate a state on the Bloch Sphere?",
      "Why is H used at the start of almost every quantum algorithm?"
    ]
  },
  "bell-state": {
    id: "bell-state",
    topic: "Bell State & Entanglement",
    title: "Creating Maximally Entangled Bell States (|Φ+⟩)",
    category: "Circuits",
    level: "Intermediate",
    summary: "A Bell state is a 2-qubit maximally entangled quantum state where measurement outcomes of both qubits are 100% correlated, regardless of spatial separation.",
    analogy: {
      title: "The Magic Pair of Dice",
      text: "Two dice are rolled in separate rooms thousands of miles apart. Each die gives an unpredictable 50/50 result individually, yet whenever Die A lands on an odd number, Die B is ALWAYS odd."
    },
    mathematics: {
      formula: "|Φ⁺⟩ = (|00⟩ + |11⟩) / √2",
      explanation: "The state cannot be factored into independent product states (|ψ₁⟩ ⊗ |ψ₂⟩). The individual qubits have no defined state until one is measured."
    },
    circuitDiagram: [
      "q0: |0⟩ ───[ H ]───●───",
      "                   │   ",
      "q1: |0⟩ ───────────X───"
    ],
    qiskitCode: `from qiskit import QuantumCircuit, Aer, execute

qc = QuantumCircuit(2, 2)
qc.h(0)         # Put control qubit into superposition
qc.cx(0, 1)     # CNOT entangles q0 and q1
qc.measure([0, 1], [0, 1])

backend = Aer.get_backend('qasm_simulator')
counts = execute(qc, backend, shots=1024).result().get_counts()
print(counts) # Returns only {'00': ~512, '11': ~512}`,
    pitfalls: [
      "Entanglement CANNOT be used for faster-than-light communication (No-Communication Theorem).",
      "Measuring qubit 0 immediately determines qubit 1, but the outcome itself was completely random."
    ],
    suggestedQuestions: [
      "How do we prepare the other 3 Bell states (|Φ-⟩, |Ψ+⟩, |Ψ-⟩)?",
      "What happens if one entangled qubit passes through a noisy channel?",
      "How is Bell state entanglement used in Quantum Teleportation?"
    ]
  },
  "bloch-sphere": {
    id: "bloch-sphere",
    topic: "Bloch Sphere",
    title: "Geometric Representation of Single Qubits",
    category: "Fundamentals",
    level: "Intermediate",
    summary: "The Bloch sphere is a unit sphere visualization where any pure single-qubit state corresponds to a unique point on the sphere surface defined by angles (θ, φ).",
    analogy: {
      title: "The Quantum Compass",
      text: "Classical bits are like the North (+Z = |0⟩) and South (-Z = |1⟩) poles of the Earth. A quantum state can point to any latitude and longitude on the globe, representing superposition and relative phase."
    },
    mathematics: {
      formula: "|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩",
      explanation: "θ is the polar angle (0 ≤ θ ≤ π) controlling probability weights, and φ is the azimuthal angle (0 ≤ φ < 2π) controlling relative quantum phase."
    },
    circuitDiagram: [
      "North Pole (Z=+1): |0⟩",
      "South Pole (Z=-1): |1⟩",
      "Equator (+X): |+⟩ = (|0⟩+|1⟩)/√2",
      "Equator (+Y): |i⟩ = (|0⟩+i|1⟩)/√2"
    ],
    qiskitCode: `from qiskit.visualization import plot_bloch_multivector
from qiskit.quantum_info import Statevector

state = Statevector.from_label('+')
# plot_bloch_multivector(state)`,
    pitfalls: [
      "Global phase e^(iγ) cannot be detected physically and does not alter the Bloch vector location.",
      "Entangled multi-qubit systems cannot be represented as individual pure states on single Bloch spheres."
    ],
    suggestedQuestions: [
      "How do X, Y, and Z gates correspond to rotations on the Bloch sphere?",
      "What is the difference between pure states and mixed states inside the sphere?",
      "Why does θ have a factor of θ/2 in the state formula?"
    ]
  },
  "grovers-algorithm": {
    id: "grovers-algorithm",
    topic: "Grover's Algorithm",
    title: "Quantum Unstructured Search & Amplitude Amplification",
    category: "Algorithms",
    level: "Advanced",
    summary: "Grover's algorithm searches an unsorted database of N items in O(√N) evaluations, offering a quadratic speedup over the classical O(N) brute force requirement.",
    analogy: {
      title: "Wave Interference in a Water Basin",
      text: "Imagine ripples in a pond where the target item flips the wave crest into a trough. A special reflector plate then amplifies the inverted ripple while dampening all other waves, making the target peak tower over the surface."
    },
    mathematics: {
      formula: "G = (2|s⟩⟨s| - I) · O_f   where |s⟩ = 1/√N ∑|x⟩",
      explanation: "The Oracle O_f flips the sign of the target state |w⟩. The Diffusion Operator (2|s⟩⟨s| - I) reflects all amplitudes around their mean value, systematically growing the target amplitude."
    },
    circuitDiagram: [
      "|0⟩^n ──[ H^⊗n ]───[ Oracle ]───[ Diffusion ]─── (Repeat ≈ π/4√N times) ───[ Measure ]"
    ],
    qiskitCode: `from qiskit import QuantumCircuit

def grover_diffusion(n_qubits):
    qc = QuantumCircuit(n_qubits)
    qc.h(range(n_qubits))
    qc.x(range(n_qubits))
    qc.h(n_qubits - 1)
    qc.mcx(list(range(n_qubits - 1)), n_qubits - 1) # Multi-controlled X
    qc.h(n_qubits - 1)
    qc.x(range(n_qubits))
    qc.h(range(n_qubits))
    return qc`,
    pitfalls: [
      "Running too many Grover iterations causes 'overcooking'—the amplitude oscillates past maximum and drops back down.",
      "Grover provides quadratic speedup, not exponential like Shor's algorithm."
    ],
    suggestedQuestions: [
      "How many iterations are optimal for N items?",
      "What is the role of the Oracle vs the Diffusion operator?",
      "How does phase kickback enable the Grover Oracle?"
    ]
  },
  "simulation-breakdown": {
    id: "simulation-breakdown",
    topic: "Simulation & Born Rule",
    title: "Interpreting 1,024 Shots Simulation Results",
    category: "Simulation",
    level: "Intermediate",
    summary: "Simulating a quantum circuit samples state probabilities through repeated shots (measurements), generating an empirical histogram governed by the Born Rule.",
    analogy: {
      title: "Repeated Quantum Polling",
      text: "Even if an election poll has exactly 50% candidate A and 50% candidate B, sampling 1,024 voters might return 514 vs 510 due to finite statistical fluctuation (shot noise)."
    },
    mathematics: {
      formula: "P(x) = |⟨x|ψ⟩|²   and   σ ≈ √(P(1-P)/Shots)",
      explanation: "As shots → ∞, measured counts divided by total shots asymptotically converge to the exact quantum probability amplitude squared."
    },
    circuitDiagram: [
      "Theoretical: P(00)=50.0%, P(11)=50.0%",
      "Measured (1024 shots): |00⟩: 518 shots (50.6%), |11⟩: 506 shots (49.4%)"
    ],
    qiskitCode: `from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

sim = AerSimulator()
# compiled_circuit = transpile(qc, sim)
# result = sim.run(compiled_circuit, shots=1024).result()`,
    pitfalls: [
      "Slight deviation from exact 50.0% is not an error—it is normal binomial statistical variance.",
      "Ideal statevector simulators give exact mathematical amplitudes; shot simulators emulate physical quantum hardware measurement."
    ],
    suggestedQuestions: [
      "How many shots are needed for 99% statistical confidence?",
      "What is the difference between statevector simulation and density matrix simulation?",
      "How do quantum readout errors skew measurement counts on real hardware?"
    ]
  },
  "circuit-analysis": {
    id: "circuit-analysis",
    topic: "Quantum Circuit Architecture",
    title: "Real-Time Circuit Analysis & Gate Decomposition",
    category: "Circuits",
    level: "Intermediate",
    summary: "A quantum circuit is a sequence of unitary quantum gates operating on qubit registers over discrete time steps (circuit depth).",
    analogy: {
      title: "The Musical Score",
      text: "Each qubit is a musical instrument wire playing notes (gates) from left to right. Multi-qubit gates like CNOT act like a conductor synchronizing multiple instruments into harmonic resonance (entanglement)."
    },
    mathematics: {
      formula: "U_total = U_k · U_(k-1) · ... · U_2 · U_1",
      explanation: "Circuit execution mathematically equates to multiplying gate unitary matrices in reverse order of appearance."
    },
    circuitDiagram: [
      "q0: ──[H]──●──[X]──[M]",
      "          │           ",
      "q1: ──────X──[Z]──[M]"
    ],
    qiskitCode: `from qiskit import QuantumCircuit
qc = QuantumCircuit(2, 2)
qc.h(0)
qc.cx(0, 1)
qc.x(0)
qc.z(1)
qc.measure([0, 1], [0, 1])`,
    pitfalls: [
      "Gates written in Dirac bracket order U|ψ⟩ apply from right to left, while circuit diagrams read from left to right.",
      "Circuit depth determines coherence decay on noisy intermediate-scale quantum (NISQ) computers."
    ],
    suggestedQuestions: [
      "What is circuit depth and why does it matter?",
      "How are two-qubit gates compiled into hardware native basis gates (e.g. CX, CZ)?",
      "What is quantum error mitigation in shallow circuits?"
    ]
  }
};

export const defaultChatHistory = [
  {
    id: "m1",
    sender: "ai" as const,
    text: "Hello Alex! I am **Qubrix AI**, your personal quantum computing tutor. Ask me anything about quantum gates, superposition, entanglement, circuit construction, or click **Explain with AI** on any topic.",
    time: "Just now",
    category: "greeting",
    suggestedChips: ["Explain Superposition", "Why H-Gate?", "How to make Bell State", "Explain Bloch Sphere", "Debug My Circuit"]
  }
];
