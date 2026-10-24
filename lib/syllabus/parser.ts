import { SyllabusUnit, Topic, TopicStatus } from '@/types';
import { generateUuid } from '@/lib/utils/uuid';

export interface ParsedSyllabusResult {
  units: SyllabusUnit[];
  topics: Omit<Topic, 'id'>[];
  unparsedLines: string[];
  summary: string;
}

export interface SampleSyllabusPreset {
  id: string;
  subjectName: string;
  subjectCode: string;
  description: string;
  rawText: string;
  unitsCount: number;
  topicsCount: number;
}

/**
 * Parses raw text copied from a syllabus, course outline, or document.
 * Deterministically identifies Units/Modules/Chapters and bulleted or numbered topics.
 */
export function parseSyllabusText(text: string, subjectId: string): ParsedSyllabusResult {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const units: SyllabusUnit[] = [];
  const topics: Omit<Topic, 'id'>[] = [];
  const unparsedLines: string[] = [];

  let currentUnit: SyllabusUnit | null = null;
  let unitOrder = 0;
  let topicOrder = 0;

  // Regex patterns for Units / Modules / Chapters
  const unitRegex = /^(?:unit|module|chapter|part|section)\s*([0-9ivxlcdm]+|[a-z])\s*[:\-\.]?\s*(.*)$/i;
  const markdownHeaderUnitRegex = /^#{1,4}\s*(?:(?:unit|module|chapter|part|section)\s*([0-9ivxlcdm]+|[a-z])\s*[:\-\.]?\s*)?(.*)$/i;

  // Regex patterns for topics
  const numberedTopicRegex = /^(?:\d+\.|\d+\.\d+|\d+\.\d+\.\d+|[a-z]\)|\([ivxlcdm]+\))\s+(.*)$/i;
  const bulletTopicRegex = /^[-*•▪–—]\s+(.*)$/;

  // Regex for extracting estimated time: e.g. (2 hrs), [45 mins], (30m), [1.5h]
  const durationRegex = /(?:\[|\()(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h|minutes?|mins?|m)(?:\]|\))/i;

  // Regex for priority hint: e.g. [High Priority], [Important], [Core]
  const priorityRegex = /(?:\[|\()(high|medium|low|important|core|essential|priority)(?:\]|\))/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is a Unit / Module header
    const unitMatch = line.match(unitRegex);
    const mdHeaderMatch = line.startsWith('#') ? line.match(markdownHeaderUnitRegex) : null;

    if (unitMatch || (mdHeaderMatch && mdHeaderMatch[2]?.trim())) {
      const unitNum = unitMatch ? unitMatch[1] : mdHeaderMatch?.[1] || `${unitOrder + 1}`;
      const unitTitle = (unitMatch ? unitMatch[2] : mdHeaderMatch?.[2] || '').trim() || `Unit ${unitNum}`;

      unitOrder++;
      currentUnit = {
        id: generateUuid(),
        subjectId,
        unitNumber: `Unit ${unitNum}`,
        title: unitTitle,
        order: unitOrder,
      };
      units.push(currentUnit);
      continue;
    }

    // Check if line is a topic
    let topicTitle = '';
    let isExplicitTopic = false;

    const numberedMatch = line.match(numberedTopicRegex);
    const bulletMatch = line.match(bulletTopicRegex);

    if (numberedMatch) {
      topicTitle = numberedMatch[1].trim();
      isExplicitTopic = true;
    } else if (bulletMatch) {
      topicTitle = bulletMatch[1].trim();
      isExplicitTopic = true;
    } else if (currentUnit) {
      // Lines under an active unit that aren't empty headers are candidate topics
      if (line.length > 2 && !line.toLowerCase().startsWith('syllabus') && !line.toLowerCase().startsWith('course outcome')) {
        topicTitle = line;
        isExplicitTopic = true;
      }
    }

    if (isExplicitTopic && topicTitle) {
      // Extract optional duration
      let estimatedMinutes: number | undefined;
      let isProvisionalEstimate = true;

      const durMatch = topicTitle.match(durationRegex);
      if (durMatch) {
        const val = parseFloat(durMatch[1]);
        const isHours = /hours?|hrs?|h/i.test(durMatch[0]);
        estimatedMinutes = Math.round(isHours ? val * 60 : val);
        isProvisionalEstimate = false;
        topicTitle = topicTitle.replace(durationRegex, '').trim();
      }

      // Extract optional priority
      let priority: 'high' | 'medium' | 'low' = 'medium';
      const prioMatch = topicTitle.match(priorityRegex);
      if (prioMatch) {
        const pWord = prioMatch[1].toLowerCase();
        if (pWord === 'high' || pWord === 'important' || pWord === 'core' || pWord === 'essential') {
          priority = 'high';
        } else if (pWord === 'low') {
          priority = 'low';
        }
        topicTitle = topicTitle.replace(priorityRegex, '').trim();
      }

      // Extract optional subtopics if delimited by commas or semicolons
      let subtopics: string[] | undefined;
      if (topicTitle.includes(';') || (topicTitle.includes(': ') && !topicTitle.toLowerCase().startsWith('unit'))) {
        const parts = topicTitle.split(/[:;]/).map((p) => p.trim()).filter(Boolean);
        if (parts.length > 1) {
          topicTitle = parts[0];
          subtopics = parts.slice(1).flatMap((p) => p.split(',').map((s) => s.trim()).filter(Boolean));
        }
      }

      topicOrder++;
      topics.push({
        subjectId,
        unitId: currentUnit ? currentUnit.id : undefined,
        unitOrModule: currentUnit ? `${currentUnit.unitNumber}: ${currentUnit.title}` : undefined,
        title: topicTitle,
        subtopics: subtopics && subtopics.length > 0 ? subtopics : undefined,
        status: 'not_started',
        estimatedMinutes: estimatedMinutes || 45, // default provisional 45m
        isProvisionalEstimate: isProvisionalEstimate,
        priority,
        order: topicOrder,
      });
    } else {
      unparsedLines.push(line);
    }
  }

  // Fallback: If no units were detected at all, but topics exist, create one comprehensive default unit
  if (units.length === 0 && topics.length > 0) {
    const defaultUnit: SyllabusUnit = {
      id: generateUuid(),
      subjectId,
      unitNumber: 'Course Syllabus',
      title: 'General Curriculum & Topics',
      order: 1,
    };
    units.push(defaultUnit);
    for (const t of topics) {
      t.unitId = defaultUnit.id;
      t.unitOrModule = defaultUnit.title;
    }
  }

  // Generate transparent summary
  const summary = `Recognized ${units.length} unit(s) and ${topics.length} topic(s). ${
    unparsedLines.length > 0 ? `${unparsedLines.length} descriptive/unstructured lines preserved for reference.` : 'Complete structure extracted.'
  }`;

  return {
    units,
    topics,
    unparsedLines,
    summary,
  };
}

/**
 * Extracts plain text from an uploaded File (.txt, .md, .json, or .pdf) client-side.
 */
export async function extractTextFromFile(file: File): Promise<{ text: string; format: string; error?: string }> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // Size limit validation (10MB)
  if (file.size > 10 * 1024 * 1024) {
    return {
      text: '',
      format: extension,
      error: 'File size exceeds 10MB limit. Please upload a smaller syllabus document or paste the text directly.',
    };
  }

  // Text-based formats (.txt, .md, .json, .csv)
  if (['txt', 'text', 'md', 'markdown', 'json', 'csv'].includes(extension)) {
    try {
      const text = await file.text();
      return { text, format: extension };
    } catch (err) {
      return {
        text: '',
        format: extension,
        error: `Could not read text file: ${err instanceof Error ? err.message : 'Unknown error'}`,
      };
    }
  }

  // PDF format
  if (extension === 'pdf') {
    try {
      const buffer = await file.arrayBuffer();
      const extractedText = extractTextFromPdfBuffer(buffer);

      if (!extractedText || extractedText.trim().length < 20) {
        return {
          text: '',
          format: 'pdf',
          error:
            'No extractable text was found in this PDF. It appears to be a scanned image or protected document without a selectable text layer. Please copy-paste the text or enter syllabus units manually.',
        };
      }

      return { text: extractedText, format: 'pdf' };
    } catch (err) {
      return {
        text: '',
        format: 'pdf',
        error: `PDF reading error: ${err instanceof Error ? err.message : 'Unable to parse PDF structure'}. Please paste text directly.`,
      };
    }
  }

  return {
    text: '',
    format: extension,
    error: `Unsupported file format (.${extension}). Supported formats are .txt, .md, and text-based .pdf files.`,
  };
}

/**
 * Client-side raw text extractor for PDF array buffers.
 * Searches for standard PDF text operators (BT...ET blocks, /Tj, /TJ, and parenthesis-enclosed literal strings).
 */
function extractTextFromPdfBuffer(buffer: ArrayBuffer): string {
  const uint8 = new Uint8Array(buffer);
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const rawContent = decoder.decode(uint8);

  const textPieces: string[] = [];

  // Match streams containing text blocks
  // Regex looks for strings inside (string) Tj or [(str1)(str2)] TJ
  const tjRegex = /\(([^()]{1,200})\)\s*Tj/g;
  let match: RegExpExecArray | null;

  while ((match = tjRegex.exec(rawContent)) !== null) {
    const clean = match[1]
      .replace(/\\([()\\])/g, '$1')
      .replace(/\\r/g, '\n')
      .replace(/\\n/g, '\n')
      .trim();
    if (clean && clean.length > 1) {
      textPieces.push(clean);
    }
  }

  // If Tj didn't catch enough, try array TJ operators: [(str1) 20 (str2)] TJ
  if (textPieces.length < 5) {
    const arrayTjRegex = /\[([\s\S]*?)\]\s*TJ/g;
    let arrayMatch: RegExpExecArray | null;

    while ((arrayMatch = arrayTjRegex.exec(rawContent)) !== null) {
      const inner = arrayMatch[1];
      const stringParts = inner.match(/\(([^()]*)\)/g);
      if (stringParts) {
        const combined = stringParts
          .map((s) => s.slice(1, -1).replace(/\\([()\\])/g, '$1'))
          .join('')
          .trim();
        if (combined && combined.length > 1) {
          textPieces.push(combined);
        }
      }
    }
  }

  // Filter out PDF internal syntax artifacts
  return textPieces
    .filter((p) => !p.startsWith('/') && !p.startsWith('xref') && !p.startsWith('obj') && p.length > 2)
    .join('\n');
}

/**
 * Predefined realistic university syllabus presets for instant 1-click exploration.
 */
export const SAMPLE_SYLLABUS_PRESETS: SampleSyllabusPreset[] = [
  {
    id: 'preset-dbms',
    subjectName: 'Database Management Systems',
    subjectCode: 'CS 315',
    description: 'Relational algebra, SQL, Normal forms (BCNF/3NF), ACID transactions, and B+ Tree indexing.',
    unitsCount: 5,
    topicsCount: 15,
    rawText: `Unit 1: Relational Data Model & Formal Query Languages
- Entity-Relationship Modeling and Constraints (45m) [Important]
- Relational Algebra Operations: Select, Project, Join, Division (60m)
- Tuple and Domain Relational Calculus (45m)

Unit 2: SQL & Relational Database Design
- Advanced SQL: Subqueries, Window Functions, Triggers (60m)
- Functional Dependencies and Inference Axioms (45m)
- Normalization: 1NF, 2NF, 3NF and Boyce-Codd Normal Form (BCNF) (90m) [High Priority]

Unit 3: Transaction Management & Concurrency Control
- ACID Properties and Transaction States (30m)
- Conflict and View Serializability (60m) [Important]
- Two-Phase Locking Protocol (2PL) and Strict 2PL (45m)
- Deadlock Handling: Detection, Prevention, and Wait-for Graph (45m)

Unit 4: Storage Engines & Indexing Architectures
- File Organization and Buffer Pool Management (45m)
- Dense vs Sparse Indexing and Multilevel Indexes (45m)
- B+ Tree Index Insertion, Deletion, and Search Complexity (60m) [High Priority]

Unit 5: Crash Recovery & Distributed Databases
- Write-Ahead Logging (WAL) and Checkpointing (45m)
- ARIES Recovery Algorithm: Analysis, Redo, Undo (60m)
- Distributed Concurrency: 2-Phase Commit (2PC) Protocol (45m)`,
  },
  {
    id: 'preset-os',
    subjectName: 'Operating Systems & Systems Programming',
    subjectCode: 'CS 301',
    description: 'Process scheduling, concurrency synchronization, virtual memory paging, and file systems.',
    unitsCount: 5,
    topicsCount: 14,
    rawText: `Unit 1: Process Management & Inter-Process Communication
- Process States, Process Control Blocks (PCB), and Context Switching (45m)
- Inter-Process Communication: Pipes, Shared Memory, Message Queues (45m)
- Thread Models, POSIX Pthreads, and User vs Kernel Threads (45m)

Unit 2: CPU Scheduling & Synchronization
- Scheduling Algorithms: FCFS, SJF, Round Robin, Multi-Level Feedback Queues (60m)
- Critical Section Problem, Peterson's Algorithm, and Hardware Primitives (45m)
- Semaphores, Mutexes, and Classic Synchronization: Dining Philosophers, Producer-Consumer (60m) [High Priority]

Unit 3: Deadlocks & Resource Allocation
- Necessary Conditions for Deadlock and Resource Allocation Graphs (30m)
- Banker's Algorithm for Deadlock Avoidance (60m) [Important]
- Deadlock Detection and Recovery Strategies (45m)

Unit 4: Memory Management & Virtual Memory
- Contiguous Allocation, Fragmentation, and Paging Architecture (45m)
- Virtual Memory, Page Faults, and Demand Paging (60m) [High Priority]
- Page Replacement Algorithms: FIFO, LRU, Optimal, Clock Algorithm (60m)
- Working Set Model and Thrashing Prevention (45m)

Unit 5: File Systems & Storage Devices
- File System Implementation, Inodes, and Directory Structures (45m)
- Disk Scheduling Algorithms: FCFS, SSTF, SCAN, C-SCAN (45m)`,
  },
  {
    id: 'preset-networks',
    subjectName: 'Computer Networks & Protocols',
    subjectCode: 'CS 320',
    description: 'OSI/TCP-IP layers, routing algorithms, transport flow/congestion control, and TLS security.',
    unitsCount: 5,
    topicsCount: 14,
    rawText: `Unit 1: Network Fundamentals & Data Link Layer
- OSI 7-Layer Reference Model vs TCP/IP Protocol Architecture (45m)
- Error Detection and Correction: Parity, CRC, Hamming Codes (60m) [Important]
- Sliding Window Protocols: Stop-and-Wait, Go-Back-N, Selective Repeat (60m)

Unit 2: Medium Access Control & Local Area Networks
- Multiple Access Protocols: Pure ALOHA, Slotted ALOHA, CSMA/CD, CSMA/CA (45m)
- Ethernet IEEE 802.3 and Wireless LAN 802.11 Protocols (45m)
- Virtual LANs (VLAN) and Spanning Tree Protocol (STP) (45m)

Unit 3: Network Layer & Internet Routing
- IPv4 and IPv6 Addressing, Subnetting, and CIDR Notation (60m) [High Priority]
- Distance Vector Routing and Count-to-Infinity Problem (45m)
- Link State Routing & Dijkstra's Shortest Path Algorithm (60m)
- Border Gateway Protocol (BGP) and Autonomous Systems (45m)

Unit 4: Transport Layer Protocols
- UDP Stateless Datagram Service and Use Cases (30m)
- TCP Connection Management: 3-Way Handshake and 4-Way Teardown (45m) [Important]
- TCP Congestion Control: Slow Start, Congestion Avoidance, Fast Retransmit (60m) [High Priority]

Unit 5: Application Layer & Network Security
- Domain Name System (DNS) Hierarchical Resolution (45m)
- HTTP/1.1 vs HTTP/2 vs HTTP/3 Architectures (45m)
- Cryptographic Principles: Public Key Cryptography, RSA, and TLS/SSL Handshake (60m) [High Priority]`,
  },
];
