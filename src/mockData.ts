import type { Activity, DashboardStats, LearningModule, Lesson, ModuleProgress, NavItem, User } from "./types";

export const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", path: "/", description: "Your learning command center" },
  { key: "learn", label: "Learn", path: "/learn", description: "Explore the quantum curriculum" },
  { key: "designer", label: "Circuit Designer", path: "/circuit-designer", description: "Build quantum circuits visually" },
  { key: "simulator", label: "Simulator", path: "/simulator", description: "Run controlled mock simulations" },
  { key: "visualizer", label: "Visualizer", path: "/visualizer", description: "Inspect quantum states and results" },
  { key: "tutor", label: "AI Tutor", path: "/tutor", description: "Interactive quantum assistant" },
  { key: "assessments", label: "Assessments", path: "/assessments", description: "Test and apply your knowledge" },
  { key: "progress", label: "Progress", path: "/progress", description: "Track your learning journey" },
  { key: "instructor", label: "Instructor", path: "/instructor", description: "Review learner analytics" },
];

export const currentUser: User = {
  name: "Alex Morgan",
  role: "Student",
  initials: "AM",
  overallProgress: 61,
};

export const dashboardStats: DashboardStats = {
  hoursLearned: "12.4",
  circuitsRun: 28,
  averageScore: 86,
  streak: 7,
};

export const activities: Activity[] = [
  { title: "Completed “Measurement” lesson", meta: "Quantum Fundamentals", time: "18 min ago", type: "lesson" },
  { title: "Ran an H-gate circuit", meta: "Qiskit Aer · 100 shots", time: "1 hr ago", type: "circuit" },
  { title: "Scored 90% on Quantum Gates", meta: "Assessment", time: "Yesterday", type: "assessment" },
  { title: "Explored the Bell-state example", meta: "Circuit Designer", time: "Yesterday", type: "circuit" },
];

const fundamentals: LearningModule = {
  id: "fundamentals",
  number: 1,
  title: "Quantum Computing Fundamentals",
  description: "Build the mental model behind qubits, states, superposition, measurement, and the probabilities used to describe quantum systems.",
  estimatedTime: "42 min",
  objectives: [
    "Explain how quantum computers differ from classical computers.",
    "Describe |0⟩ and |1⟩ as the computational basis states of a qubit.",
    "Explain superposition and how measurement produces classical outcomes.",
    "Interpret probability amplitudes at a beginner level.",
  ],
  lessons: [
    {
      id: "what-is-quantum-computing",
      moduleId: "fundamentals",
      title: "What is quantum computing?",
      description: "Learn what makes a quantum computer different and where qubits fit into the picture.",
      duration: "7 min",
      difficulty: "Beginner",
      sections: [
        { heading: "A different computing model", body: "Classical computers process information with bits that are either 0 or 1. Quantum computers use quantum systems as information carriers, allowing states and operations that have no direct classical equivalent." },
        { heading: "Why it matters", body: "Quantum algorithms can exploit superposition, interference, and entanglement to solve some problems in fundamentally different ways. They are not simply faster versions of ordinary computers." },
        { heading: "The building block: a qubit", body: "A qubit is the basic unit of quantum information. Its state is described by amplitudes for the basis states |0⟩ and |1⟩. The amplitudes determine the probabilities observed when the qubit is measured." },
      ],
      example: { type: "state", title: "Meet a qubit", description: "Switch between the two basis states and an equal superposition to see how the language of qubits changes." },
      takeaways: ["Bits have classical 0/1 values; qubits use quantum states.", "Quantum algorithms use effects such as superposition and interference.", "A qubit is described using amplitudes associated with basis states."],
    },
    {
      id: "classical-bits-vs-qubits",
      moduleId: "fundamentals",
      title: "Classical bits vs qubits",
      description: "Compare the information models used by classical and quantum computers.",
      duration: "6 min",
      difficulty: "Beginner",
      sections: [
        { heading: "Bits are discrete", body: "A classical bit stores one of two values: 0 or 1. A register of n bits therefore has one definite n-bit value at a time." },
        { heading: "Qubits use amplitudes", body: "A qubit can be written as α|0⟩ + β|1⟩, where α and β are amplitudes whose squared magnitudes sum to 1. This describes a quantum state rather than a hidden classical bit." },
        { heading: "Measurement connects the models", body: "When a qubit is measured in the computational basis, the result is a classical 0 or 1. The measurement probabilities come from the state's amplitudes." },
      ],
      example: { type: "state", title: "State selector", description: "Compare definite basis states with a balanced state before measurement." },
      takeaways: ["A classical bit is 0 or 1.", "A qubit state can contain amplitudes for both basis states.", "Measurement produces a classical outcome."],
    },
    {
      id: "qubit-states",
      moduleId: "fundamentals",
      title: "Qubit states",
      description: "Read the notation for basis states and understand normalized qubit state vectors.",
      duration: "7 min",
      difficulty: "Beginner",
      sections: [
        { heading: "Basis states", body: "|0⟩ and |1⟩ are the standard computational basis states. They are the two outcomes used when a single qubit is measured in the computational basis." },
        { heading: "A compact notation", body: "We write a general pure qubit state as |ψ⟩ = α|0⟩ + β|1⟩. Normalization requires |α|² + |β|² = 1." },
        { heading: "State is not probability alone", body: "The amplitudes can be complex numbers, so they contain phase information in addition to the probabilities obtained from their magnitudes." },
      ],
      example: { type: "state", title: "Read the state", description: "Move between example states and inspect their basis probabilities." },
      takeaways: ["|0⟩ and |1⟩ form the computational basis.", "A qubit state is a normalized linear combination of basis states.", "Amplitude phase can matter even when measurement probabilities look identical."],
    },
    {
      id: "superposition",
      moduleId: "fundamentals",
      title: "Superposition",
      description: "See how the Hadamard gate transforms |0⟩ into an equal superposition.",
      duration: "8 min",
      difficulty: "Beginner",
      sections: [
        { heading: "What superposition means", body: "A qubit is in superposition when its state is a non-trivial linear combination of basis states. For example, (|0⟩ + |1⟩)/√2 gives equal measurement probabilities in the computational basis." },
        { heading: "The Hadamard gate", body: "Applying H to |0⟩ creates (|0⟩ + |1⟩)/√2. Applying H to |1⟩ creates (|0⟩ − |1⟩)/√2. The relative sign is phase information that can affect later interference." },
        { heading: "Measurement probabilities", body: "For the equal superposition, the probability of observing 0 is 50% and the probability of observing 1 is 50%. The displayed result here is a deterministic teaching example, not a physical measurement." },
      ],
      example: { type: "hadamard", title: "Build a superposition", description: "Toggle the H gate to compare |0⟩ with the equal-superposition state and its mocked measurement distribution.", },
      takeaways: ["Superposition is a linear combination of basis states.", "H maps |0⟩ to an equal superposition.", "Measurement of the equal superposition gives 50% / 50% probabilities in the computational basis."],
      circuit: ["q0: |0⟩ ── H ── M", "     50% |0⟩   50% |1⟩"],
    },
    {
      id: "measurement",
      moduleId: "fundamentals",
      title: "Measurement",
      description: "Understand what a measurement records and why it changes the state you are describing.",
      duration: "7 min",
      difficulty: "Beginner",
      sections: [
        { heading: "From quantum to classical", body: "A measurement maps a quantum state to an observed classical outcome. In the computational basis, a single qubit measurement returns 0 or 1." },
        { heading: "Probability is part of the state description", body: "If |ψ⟩ = α|0⟩ + β|1⟩, the computational-basis probabilities are |α|² and |β|². Repeating the same preparation and measurement can produce different individual outcomes." },
        { heading: "Why the state changes", body: "After an ideal computational-basis measurement, the measured qubit is left in the corresponding basis state in the standard textbook model. This is why measurement is not just passive observation." },
      ],
      example: { type: "measurement", title: "Mock a measurement", description: "Reveal one deterministic sample outcome alongside the underlying 50% / 50% probability distribution." },
      takeaways: ["Measurement produces a classical outcome.", "Probabilities come from squared amplitude magnitudes.", "An ideal measurement changes the post-measurement state."],
    },
    {
      id: "probability-amplitudes",
      moduleId: "fundamentals",
      title: "Probability amplitudes",
      description: "Connect amplitudes, normalization, and measurement probabilities.",
      duration: "7 min",
      difficulty: "Beginner",
      sections: [
        { heading: "Amplitude versus probability", body: "The coefficients α and β are amplitudes. Their squared magnitudes, |α|² and |β|², are the corresponding computational-basis probabilities." },
        { heading: "Normalization", body: "A valid single-qubit state must satisfy |α|² + |β|² = 1. This ensures the probabilities of all possible measurement outcomes add to one." },
        { heading: "A simple example", body: "For √0.8|0⟩ + √0.2|1⟩, the probabilities are 80% for 0 and 20% for 1. The square-root coefficients are amplitudes, not percentages." },
      ],
      example: { type: "measurement", title: "Read the probabilities", description: "Inspect a fixed amplitude example and its corresponding probability bars." },
      takeaways: ["Amplitudes are not the same thing as probabilities.", "Square magnitudes of amplitudes give measurement probabilities.", "Normalization keeps total probability equal to 1."],
    },
  ],
};

const gates: LearningModule = {
  id: "gates",
  number: 2,
  title: "Quantum Gates",
  description: "Learn the core single- and multi-qubit operations used to transform quantum states and construct circuits.",
  estimatedTime: "50 min",
  objectives: [
    "Recognize the common single-qubit gate symbols.",
    "Describe how X, Y, and Z transform a qubit.",
    "Explain H as a superposition-producing operation.",
    "Distinguish phase gates from bit-flip behavior.",
    "Understand the control-target structure of CNOT.",
  ],
  lessons: [
    { id: "x-gate", moduleId: "gates", title: "X gate", description: "Learn the quantum analogue of a classical bit flip.", duration: "6 min", difficulty: "Beginner", sections: [
      { heading: "The bit-flip gate", body: "The X gate swaps the computational basis states: X|0⟩ = |1⟩ and X|1⟩ = |0⟩. Its matrix is the familiar Pauli-X operator." },
      { heading: "When to use it", body: "X is useful when a circuit needs to invert a qubit's computational-basis state. Applying X twice returns the qubit to its starting state." },
    ], example: { type: "gate", title: "Explore X", description: "Select X to see its symbol, purpose, and effect on |0⟩." }, takeaways: ["X flips |0⟩ and |1⟩.", "X is its own inverse.", "It changes the computational basis value."], circuit: ["q0: |0⟩ ── X ── |1⟩"] },
    { id: "y-gate", moduleId: "gates", title: "Y gate", description: "Understand a Pauli gate that flips a basis state while adding phase.", duration: "6 min", difficulty: "Intermediate", sections: [
      { heading: "Flip plus phase", body: "The Y gate is the Pauli-Y operator. It maps |0⟩ to i|1⟩ and |1⟩ to −i|0⟩, so it combines a basis-state flip with a phase factor." },
      { heading: "Why phase matters", body: "The phase does not change a direct computational-basis probability, but it can affect interference after later gates." },
    ], example: { type: "gate", title: "Explore Y", description: "Inspect the Y gate and its phase-aware action on a basis state." }, takeaways: ["Y flips basis states.", "Y also introduces a phase factor.", "Phase can affect later interference."], circuit: ["q0: |0⟩ ── Y ── i|1⟩"] },
    { id: "z-gate", moduleId: "gates", title: "Z gate", description: "See how a phase flip can change interference without changing basis probabilities immediately.", duration: "6 min", difficulty: "Intermediate", sections: [
      { heading: "A phase operation", body: "The Z gate leaves |0⟩ unchanged and maps |1⟩ to −|1⟩. It therefore changes the relative phase between basis components." },
      { heading: "Not a classical flip", body: "Unlike X, Z does not swap 0 and 1. Its effect becomes especially visible when the qubit is in superposition and later gates convert phase into observable interference." },
    ], example: { type: "gate", title: "Explore Z", description: "Inspect Z's effect on the basis states and its phase behavior." }, takeaways: ["Z leaves |0⟩ unchanged.", "Z adds a minus sign to |1⟩.", "Relative phase matters in later interference."], circuit: ["q0: |1⟩ ── Z ── −|1⟩"] },
    { id: "h-gate", moduleId: "gates", title: "Hadamard gate", description: "Use H to create and recombine superposition.", duration: "7 min", difficulty: "Beginner", sections: [
      { heading: "Creating superposition", body: "H maps |0⟩ to (|0⟩ + |1⟩)/√2 and |1⟩ to (|0⟩ − |1⟩)/√2. It is one of the most recognizable gates in introductory quantum circuits." },
      { heading: "Creating interference", body: "Because H is its own inverse, applying H twice returns a basis state. This makes H useful for both creating superposition and turning phase differences into measurable effects." },
    ], example: { type: "hadamard", title: "Explore H", description: "Compare the input basis state with H's equal-superposition output." }, takeaways: ["H creates equal superposition from a basis state.", "H is its own inverse.", "H helps expose phase through interference."], circuit: ["q0: |0⟩ ── H ── (|0⟩+|1⟩)/√2"] },
    { id: "s-gate", moduleId: "gates", title: "S gate", description: "Introduce a quarter-turn phase operation.", duration: "6 min", difficulty: "Intermediate", sections: [
      { heading: "Phase rotation", body: "The S gate leaves |0⟩ unchanged and maps |1⟩ to i|1⟩. It adds a 90-degree phase to the |1⟩ component." },
      { heading: "A building block", body: "S is a useful phase gate and satisfies S² = Z. Its effect is easiest to understand when a state contains both |0⟩ and |1⟩ components." },
    ], example: { type: "gate", title: "Explore S", description: "Inspect the S gate's phase effect on |1⟩." }, takeaways: ["S adds a quarter-turn phase to |1⟩.", "S² equals Z.", "Phase changes become observable through interference."], circuit: ["q0: |1⟩ ── S ── i|1⟩"] },
    { id: "t-gate", moduleId: "gates", title: "T gate", description: "Learn a smaller phase rotation used throughout quantum circuits.", duration: "6 min", difficulty: "Intermediate", sections: [
      { heading: "An eighth-turn phase", body: "The T gate maps |1⟩ to e^(iπ/4)|1⟩ while leaving |0⟩ unchanged. It applies a 45-degree phase rotation to the |1⟩ component." },
      { heading: "Why small rotations matter", body: "Quantum circuits can combine phase rotations to build richer transformations. T is a standard gate in many circuit representations." },
    ], example: { type: "gate", title: "Explore T", description: "Inspect T's phase rotation and compare it with S." }, takeaways: ["T applies a π/4 phase to |1⟩.", "T is a phase gate.", "Small phase rotations can be composed into larger transformations."], circuit: ["q0: |1⟩ ── T ── e^(iπ/4)|1⟩"] },
    { id: "cnot-gate", moduleId: "gates", title: "CNOT gate", description: "Understand a two-qubit controlled operation and its role in entanglement.", duration: "7 min", difficulty: "Intermediate", sections: [
      { heading: "Control and target", body: "CNOT uses one qubit as a control and another as a target. If the control is |1⟩, the gate applies X to the target; if the control is |0⟩, the target is unchanged." },
      { heading: "A route to entanglement", body: "A common pattern is H on one qubit followed by CNOT with that qubit as control. Starting from |00⟩, this prepares the Bell state (|00⟩ + |11⟩)/√2." },
    ], example: { type: "gate", title: "Explore CNOT", description: "Select CNOT to see its control-target behavior." }, takeaways: ["CNOT has a control and a target.", "The target flips only when the control is 1.", "H followed by CNOT can create entanglement."], circuit: ["q0: |0⟩ ── H ── ● ──", "                 │", "q1: |0⟩ ───────── X ──"] },
    { id: "measurement-operation", moduleId: "gates", title: "Measurement operation", description: "Recognize measurement as the operation that records a classical outcome.", duration: "6 min", difficulty: "Beginner", sections: [
      { heading: "Measurement in a circuit", body: "A measurement operation reads a qubit in a chosen basis and records a classical result. In the common computational basis, the result is 0 or 1." },
      { heading: "Placement matters", body: "Measurement is often shown at the end of a circuit because it converts the quantum state into data that a classical program can inspect." },
    ], example: { type: "measurement", title: "Explore measurement", description: "Reveal a deterministic sample result from a mocked 50% / 50% state." }, takeaways: ["Measurement produces classical data.", "Computational-basis measurement returns 0 or 1.", "Measurement is distinct from reversible quantum gates."], circuit: ["q0: |+⟩ ───────── M ── 0 / 1"] },
  ],
};

const concepts: LearningModule = {
  id: "concepts",
  number: 3,
  title: "Quantum Concepts",
  description: "Connect the core ideas of superposition, entanglement, measurement, state representation, and the Bloch sphere.",
  estimatedTime: "38 min",
  objectives: [
    "Recognize superposition as a state description rather than a classical mixture.",
    "Explain entanglement using correlations between qubits.",
    "Read common single-qubit state representations.",
    "Understand what the Bloch sphere communicates.",
  ],
  lessons: [
    { id: "concept-superposition", moduleId: "concepts", title: "Superposition", description: "Revisit superposition with a focus on intuition, amplitudes, and interference.", duration: "7 min", difficulty: "Beginner", sections: [
      { heading: "One state, multiple basis components", body: "Superposition describes a single quantum state with amplitudes for multiple basis states. It is not the same as saying the qubit secretly has one classical value and we simply do not know it." },
      { heading: "Interference is the payoff", body: "Quantum algorithms manipulate amplitudes so that useful outcomes are reinforced and others can cancel. Superposition provides the space in which those amplitude changes occur." },
    ], example: { type: "hadamard", title: "See interference setup", description: "Toggle H to compare a basis state with a balanced superposition." }, takeaways: ["Superposition is a quantum state description.", "Amplitudes can interfere.", "H is a simple way to create a balanced superposition."] },
    { id: "entanglement", moduleId: "concepts", title: "Entanglement", description: "Understand why a multi-qubit state can contain correlations that cannot be reduced to independent single-qubit states.", duration: "9 min", difficulty: "Intermediate", sections: [
      { heading: "Correlated quantum states", body: "Entanglement occurs when the joint state of multiple qubits cannot be written as a product of individual qubit states. The information is in the relationship between the qubits." },
      { heading: "Bell-state example", body: "Starting with |00⟩, apply H to the first qubit and CNOT from the first to the second. The resulting Bell state is (|00⟩ + |11⟩)/√2." },
      { heading: "What measurement shows", body: "Measuring this ideal Bell state in the computational basis gives matching outcomes: 00 or 11 in this example. The mock result illustrates the correlation, not a physical experiment." },
    ], example: { type: "gate", title: "Bell-state circuit", description: "Inspect the H + CNOT pattern used to create a simple entangled state." }, takeaways: ["Entanglement is a property of the joint state.", "H + CNOT is a standard Bell-state preparation pattern.", "Correlated measurement outcomes do not mean the qubits are individually predetermined classical bits."], circuit: ["q0: |0⟩ ── H ── ● ──", "                 │", "q1: |0⟩ ───────── X ──"] },
    { id: "concept-measurement", moduleId: "concepts", title: "Measurement", description: "Connect measurement probabilities with the state representation used before observation.", duration: "7 min", difficulty: "Beginner", sections: [
      { heading: "Probability from amplitudes", body: "For a state α|0⟩ + β|1⟩, computational-basis measurement probabilities are |α|² and |β|²." },
      { heading: "One outcome per shot", body: "A single measurement returns one classical outcome. A histogram across many shots estimates the underlying probability distribution." },
    ], example: { type: "measurement", title: "Read a histogram", description: "Compare the probability distribution with one mocked sample outcome." }, takeaways: ["A shot produces one outcome.", "Many shots reveal an empirical distribution.", "The distribution reflects the state's amplitudes."] },
    { id: "state-representation", moduleId: "concepts", title: "Quantum state representation", description: "Learn the common vector notation used to represent small quantum states.", duration: "8 min", difficulty: "Intermediate", sections: [
      { heading: "Dirac notation", body: "Ket notation such as |ψ⟩ is a compact way to write quantum states. For one qubit, α|0⟩ + β|1⟩ is the standard form." },
      { heading: "Vector form", body: "The same state can be represented by the column vector [α, β]ᵀ in the computational basis. This representation makes matrix-based gate operations explicit." },
    ], example: { type: "state", title: "Compare representations", description: "Switch among basis and superposition examples while keeping the state notation visible." }, takeaways: ["Ket and vector notation describe the same state.", "The computational basis gives a natural coordinate system.", "Gates act on state vectors through matrix transformations."] },
    { id: "bloch-sphere-intro", moduleId: "concepts", title: "Bloch sphere", description: "Build an intuition for how any pure single-qubit state can be represented geometrically.", duration: "7 min", difficulty: "Intermediate", sections: [
      { heading: "A geometric map", body: "The Bloch sphere represents pure single-qubit states as points on a sphere. |0⟩ and |1⟩ sit at opposite poles." },
      { heading: "Angles and phase", body: "The polar and azimuthal angles encode the relative weights and phase between |0⟩ and |1⟩. Quantum gates can be understood as rotations or combinations of rotations on this representation." },
    ], example: { type: "state", title: "Bloch-state preview", description: "Use the state selector to see which conceptual point on the sphere the example represents." }, takeaways: ["The Bloch sphere is a visualization for a single qubit.", "|0⟩ and |1⟩ are opposite poles.", "Relative phase changes the state's position around the sphere."] },
  ],
};

const algorithms: LearningModule = {
  id: "algorithms",
  number: 4,
  title: "Quantum Algorithms",
  description: "Get a guided introduction to four important algorithms and the problem-solving patterns behind them.",
  estimatedTime: "35 min",
  objectives: [
    "Describe the purpose of the Deutsch-Jozsa algorithm.",
    "Explain the intuition behind Grover's amplitude amplification.",
    "Recognize QAOA as a variational optimization approach.",
    "Recognize VQE as a variational method for estimating ground-state energies.",
  ],
  lessons: [
    { id: "deutsch-jozsa", moduleId: "algorithms", title: "Deutsch-Jozsa", description: "Understand how phase kickback and interference can distinguish promised function classes.", duration: "9 min", difficulty: "Intermediate", sections: [
      { heading: "The promise problem", body: "Deutsch-Jozsa considers a function promised to be either constant or balanced. The goal is to determine which case applies using fewer function evaluations than a deterministic classical strategy in the oracle model." },
      { heading: "Quantum pattern", body: "Hadamards create superposition, the oracle encodes function values into phase, and a second layer of Hadamards makes interference reveal the answer in the ideal promised setting." },
    ], example: { type: "gate", title: "Algorithm skeleton", description: "Inspect the repeated H → oracle → H structure without executing a real oracle." }, takeaways: ["Deutsch-Jozsa is a promise problem.", "Phase kickback encodes oracle information.", "Interference turns phase information into a measurable pattern."], circuit: ["input:  |0⟩ ── H ── Oracle ── H ── M", "ancilla: |1⟩ ── H ── Oracle ─────────"] },
    { id: "grover", moduleId: "algorithms", title: "Grover's Algorithm", description: "Learn the amplitude-amplification idea behind unstructured search.", duration: "9 min", difficulty: "Intermediate", sections: [
      { heading: "Search without structure", body: "Grover's algorithm addresses unstructured search by repeatedly increasing the amplitude of a marked state and reducing the amplitudes of unmarked states." },
      { heading: "Oracle and diffusion", body: "The oracle marks the target through a phase change. The diffusion operator then reflects amplitudes around their average, amplifying the marked state's amplitude." },
    ], example: { type: "measurement", title: "Mock amplification", description: "Compare an illustrative pre-search distribution with a higher target probability after a mocked iteration." }, takeaways: ["Grover uses an oracle plus diffusion.", "Amplitude amplification increases the target probability.", "The ideal query complexity is proportional to the square root of the search space size."] },
    { id: "qaoa", moduleId: "algorithms", title: "QAOA", description: "See how a parameterized quantum circuit can be used for combinatorial optimization.", duration: "8 min", difficulty: "Intermediate", sections: [
      { heading: "A variational pattern", body: "The Quantum Approximate Optimization Algorithm alternates problem-dependent and mixing operations controlled by tunable parameters." },
      { heading: "Classical feedback loop", body: "A classical optimizer proposes parameters, the quantum circuit is evaluated, and the measured objective guides the next parameter update. This MVP only illustrates the loop." },
    ], example: { type: "gate", title: "QAOA loop", description: "Inspect the conceptual sequence of parameterized problem and mixing layers." }, takeaways: ["QAOA is variational.", "Parameters are optimized using a classical feedback loop.", "The circuit structure depends on the problem being optimized."], circuit: ["|+⟩ ── Problem(γ) ── Mixer(β) ── Measure"] },
    { id: "vqe", moduleId: "algorithms", title: "VQE", description: "Understand how variational circuits can estimate ground-state energies.", duration: "9 min", difficulty: "Intermediate", sections: [
      { heading: "Energy as an objective", body: "The Variational Quantum Eigensolver prepares a parameterized state and estimates the expectation value of a Hamiltonian. The goal is to minimize the estimated energy." },
      { heading: "Hybrid workflow", body: "A classical optimizer updates circuit parameters while quantum measurements provide expectation-value estimates. The process repeats until the objective stabilizes." },
    ], example: { type: "measurement", title: "Mock energy estimate", description: "Inspect a fixed illustrative energy value and how it could improve over optimization steps." }, takeaways: ["VQE estimates an energy expectation value.", "A parameterized circuit represents candidate states.", "Classical optimization and quantum measurements form a hybrid loop."] },
  ],
};

export const learningModules: LearningModule[] = [fundamentals, gates, concepts, algorithms];
export const learningLessons: Lesson[] = learningModules.flatMap((module) => module.lessons);

export const initialCompletedLessonIds = [
  "what-is-quantum-computing",
  "classical-bits-vs-qubits",
  "qubit-states",
  "x-gate",
  "y-gate",
  "z-gate",
  "h-gate",
  "s-gate",
  "concept-superposition",
  "entanglement",
  "concept-measurement",
  "deutsch-jozsa",
  "grover",
  "qaoa",
];

export function getModule(moduleId: string) {
  return learningModules.find((module) => module.id === moduleId);
}

export function getLesson(lessonId: string) {
  return learningLessons.find((lesson) => lesson.id === lessonId);
}

export function getModuleProgress(module: LearningModule, completedIds: string[]): ModuleProgress {
  const completed = module.lessons.filter((lesson) => completedIds.includes(lesson.id)).length;
  return { name: module.title, completed, total: module.lessons.length };
}

export function getAllModuleProgress(completedIds: string[]) {
  return learningModules.map((module) => getModuleProgress(module, completedIds));
}

export function getLessonIndex(moduleId: string, lessonId: string) {
  const module = getModule(moduleId);
  return module ? module.lessons.findIndex((lesson) => lesson.id === lessonId) : -1;
}

export function getContinueLesson(completedIds: string[]) {
  return learningLessons.find((lesson) => !completedIds.includes(lesson.id)) ?? learningLessons[learningLessons.length - 1];
}


export const assessments = [
  { title: "Quantum Fundamentals Checkpoint", questions: 8, score: 90, status: "Completed" },
  { title: "Quantum Gates Practice", questions: 10, score: 0, status: "In progress" },
  { title: "Algorithms Starter Challenge", questions: 6, score: 0, status: "Not started" },
];