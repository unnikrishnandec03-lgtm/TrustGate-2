/**
 * TrustGate Metadata Forensic Comparison Engine
 * Performs deterministic metadata diffing, chronology paradox audits,
 * and software footprint identification.
 * Handles:
 * 1. Internal Coherence Comparison: Timestamps, tool signatures, hardware headers vs physical laws
 * 2. Cross-File / Benchmark Comparison: Suspect document vs authentic reference template baseline
 */

export interface SuspectMetadata {
  fileName?: string;
  fileSizeKB?: string | number;
  mimeType?: string;
  lastModified?: string;
  documentType?: 'PAYSLIP' | 'INVOICE' | 'STATEMENT' | 'ID_PASSPORT' | 'PHOTO' | 'GENERAL';
  creationDate?: string;
  modifyDate?: string;
  dateTimeOriginal?: string;
  dateTime?: string;
  creator?: string;
  producer?: string;
  software?: string;
  historySoftwareAgent?: string;
  cameraMake?: string;
  cameraModel?: string;
  fNumber?: number | string;
  exposureTime?: number | string;
  iso?: number | string;
  width?: number;
  height?: number;
  colorSpace?: string;
  [key: string]: any;
}

export interface ReferenceMetadata {
  documentType?: string;
  mimeType?: string;
  producer?: string;
  creator?: string;
  width?: number;
  height?: number;
  colorSpace?: string;
  expectedSoftware?: string;
  [key: string]: any;
}

export interface MetadataAuditFinding {
  code: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  detail: string;
}

export interface MetadataFieldDiff {
  field: string;
  expected: string;
  observed: string;
  status: 'MISMATCH' | 'CROPPED' | 'ALTERED' | 'MATCH';
}

export interface MetadataAuditResult {
  dynamicMetadataScore: number; // 0 to 100
  isTampered: boolean;
  verdict: 'CONFIRMED_METADATA_TAMPERING' | 'SUSPICIOUS_ANOMALY' | 'CLEAN_VERIFIED';
  findingsSummary: MetadataAuditFinding[];
  fieldLevelDiff: MetadataFieldDiff[];
  auditTimestamp: string;
}

// Known photo editing suites, generative tools, and virtual capture drivers
const DISALLOWED_SOFTWARE_SIGNATURES = [
  { pattern: /photoshop/i, label: 'Adobe Photoshop' },
  { pattern: /gimp/i, label: 'GIMP' },
  { pattern: /canva/i, label: 'Canva Web Suite' },
  { pattern: /illustrator/i, label: 'Adobe Illustrator' },
  { pattern: /coreldraw/i, label: 'CorelDRAW' },
  { pattern: /stable diffusion|automatic1111|comfyui/i, label: 'Latent Diffusion WebUI' },
  { pattern: /midjourney/i, label: 'Midjourney Engine' },
  { pattern: /deepfacelab|faceswap|roop/i, label: 'FaceSwap Pipeline' },
  { pattern: /obs|manycam|virtual/i, label: 'Virtual Camera Driver' },
];

// Legitimate enterprise PDF/billing engines
const AUTHORITATIVE_BILLING_PRODUCERS = [
  /itext/i,
  /reportlab/i,
  /apache fop/i,
  /quartz pdfcontext/i,
  /sap netweaver/i,
  /jasperreports/i,
];

/**
 * Normalizes date strings (ISO, EXIF 'YYYY:MM:DD HH:MM:SS') into Unix timestamps (ms)
 */
export function parseTimestamp(dateStr?: string | null): number | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  // Convert standard EXIF format "2024:08:15 12:30:00" to "2024-08-15 12:30:00"
  const normalized = dateStr.trim().replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3');
  const parsed = new Date(normalized).getTime();
  return isNaN(parsed) ? null : parsed;
}

/**
 * Compares and Audits Document/Image Metadata
 * @param suspectMeta - Extracted metadata of the uploaded suspect asset
 * @param referenceMeta - (Optional) Metadata of an authentic template or web match
 * @returns Forensic diff findings and dynamically calculated risk score
 */
export function compareAndAuditMetadata(
  suspectMeta: SuspectMetadata,
  referenceMeta: ReferenceMetadata | null = null
): MetadataAuditResult {
  const findings: MetadataAuditFinding[] = [];
  const fieldDiffs: MetadataFieldDiff[] = [];
  let calculatedRisk = 0;

  // -------------------------------------------------------------
  // TEST 1: CHRONOLOGICAL PARADOX (ModDate < CreateDate)
  // -------------------------------------------------------------
  const tCreate = parseTimestamp(suspectMeta.creationDate || suspectMeta.dateTimeOriginal);
  const tMod = parseTimestamp(suspectMeta.modifyDate || suspectMeta.dateTime);

  if (tCreate && tMod) {
    const deltaSeconds = (tMod - tCreate) / 1000;

    if (deltaSeconds < -1) {
      // Physical impossibility: modified before it was created
      calculatedRisk += 45;
      findings.push({
        code: 'META_CHRONOLOGY_PARADOX',
        severity: 'CRITICAL',
        title: 'Temporal Inversion Paradox',
        detail: `Modification timestamp precedes Creation timestamp by ${Math.abs(deltaSeconds).toFixed(0)}s. Indicates manual timestamp tampering or metadata reconstruction.`,
      });
    } else if (deltaSeconds > 86400 * 30 && suspectMeta.documentType === 'PAYSLIP') {
      // Incremental revisions made months after issuance
      calculatedRisk += 20;
      findings.push({
        code: 'META_POST_ISSUANCE_REVISION',
        severity: 'MEDIUM',
        title: 'Late Post-Issuance Revision',
        detail: `Document was modified ${(deltaSeconds / 86400).toFixed(0)} days after its creation timestamp.`,
      });
    }
  }

  // -------------------------------------------------------------
  // TEST 2: FORBIDDEN SOFTWARE & EDITING TOOL FOOTPRINTS
  // -------------------------------------------------------------
  const combinedSoftwareString = [
    suspectMeta.creator,
    suspectMeta.producer,
    suspectMeta.software,
    suspectMeta.historySoftwareAgent,
  ]
    .filter(Boolean)
    .join(' | ');

  const detectedTool = DISALLOWED_SOFTWARE_SIGNATURES.find((sig) =>
    sig.pattern.test(combinedSoftwareString)
  );

  if (detectedTool) {
    calculatedRisk += 50;
    findings.push({
      code: 'META_UNAUTHORIZED_SOFTWARE',
      severity: 'CRITICAL',
      title: 'Graphic Editor Fingerprint Detected',
      detail: `File metadata contains authoring signature for "${detectedTool.label}". Authoritative documents originate from ERP/billing servers, not graphic software.`,
    });
  } else {
    // Check if generated by an authentic enterprise engine
    const isEnterprise = AUTHORITATIVE_BILLING_PRODUCERS.some((sig) =>
      sig.test(combinedSoftwareString)
    );
    if (isEnterprise) {
      calculatedRisk = Math.max(0, calculatedRisk - 10); // Reward for genuine billing engine
    }
  }

  // -------------------------------------------------------------
  // TEST 3: STRIPPED METADATA / GHOST HEADER PROFILE
  // -------------------------------------------------------------
  const coreTags = ['creator', 'producer', 'software', 'creationDate', 'modifyDate'];
  const presentTagsCount = coreTags.filter((tag) => Boolean(suspectMeta[tag])).length;

  if (presentTagsCount === 0 && suspectMeta.mimeType === 'application/pdf') {
    calculatedRisk += 30;
    findings.push({
      code: 'META_STRIPPED_HEADERS',
      severity: 'HIGH',
      title: 'Anonymized / Stripped Metadata Headers',
      detail:
        'All authoring headers and producer dictionaries have been wiped, a common marker of scraped templates or counter-forensic wiping.',
    });
  }

  // -------------------------------------------------------------
  // TEST 4: HARDWARE OPTICAL PARITY (For Camera / ID Photos)
  // -------------------------------------------------------------
  if (suspectMeta.cameraMake || suspectMeta.cameraModel) {
    const hasAperture = Boolean(suspectMeta.fNumber);
    const hasExposure = Boolean(suspectMeta.exposureTime);
    const hasIso = Boolean(suspectMeta.iso);

    // If an image claims to be a hardware camera capture but omits all lens exposure fields
    if (!hasAperture && !hasExposure && !hasIso) {
      calculatedRisk += 25;
      findings.push({
        code: 'META_SPOOFED_HARDWARE_TAG',
        severity: 'MEDIUM',
        title: 'Spoofed Camera Device Signature',
        detail: `Document claims device "${suspectMeta.cameraMake || ''} ${suspectMeta.cameraModel || ''}".trim() but lacks physical exposure parameters (F-number, Shutter, ISO).`,
      });
    }
  }

  // -------------------------------------------------------------
  // TEST 5: CROSS-FILE COMPARISON (Against Clean Template or Web Reference)
  // -------------------------------------------------------------
  if (referenceMeta) {
    // A. Producer Engine Divergence
    if (referenceMeta.producer && suspectMeta.producer && referenceMeta.producer !== suspectMeta.producer) {
      calculatedRisk += 35;
      findings.push({
        code: 'META_PRODUCER_DIVERGENCE',
        severity: 'HIGH',
        title: 'Template Producer Mismatch',
        detail: `Expected authentic producer "${referenceMeta.producer}", but observed "${suspectMeta.producer}".`,
      });
      fieldDiffs.push({
        field: 'Producer',
        expected: referenceMeta.producer,
        observed: suspectMeta.producer,
        status: 'MISMATCH',
      });
    }

    // B. Color Space / ICC Profile Delta (e.g. sRGB vs Display P3 vs CMYK)
    if (referenceMeta.colorSpace && suspectMeta.colorSpace && referenceMeta.colorSpace !== suspectMeta.colorSpace) {
      calculatedRisk += 15;
      findings.push({
        code: 'META_COLORSPACE_DELTA',
        severity: 'LOW',
        title: 'Color Profile Inconsistency',
        detail: `Color space changed from baseline "${referenceMeta.colorSpace}" to "${suspectMeta.colorSpace}".`,
      });
      fieldDiffs.push({
        field: 'ColorSpace',
        expected: referenceMeta.colorSpace,
        observed: suspectMeta.colorSpace,
        status: 'MISMATCH',
      });
    }

    // C. Resolution Aspect Ratio Alteration
    if (referenceMeta.width && referenceMeta.height && suspectMeta.width && suspectMeta.height) {
      const refRatio = (referenceMeta.width / referenceMeta.height).toFixed(3);
      const susRatio = (suspectMeta.width / suspectMeta.height).toFixed(3);

      if (refRatio !== susRatio) {
        calculatedRisk += 20;
        findings.push({
          code: 'META_ASPECT_RATIO_TAMPERING',
          severity: 'MEDIUM',
          title: 'Document Aspect Ratio Rescaled',
          detail: `Baseline aspect ratio is ${refRatio}, but suspect document has been cropped or scaled to ${susRatio}.`,
        });
        fieldDiffs.push({
          field: 'Aspect Ratio',
          expected: `${refRatio} (${referenceMeta.width}x${referenceMeta.height})`,
          observed: `${susRatio} (${suspectMeta.width}x${suspectMeta.height})`,
          status: 'CROPPED',
        });
      }
    }
  }

  // Ensure risk score is capped between 0 and 100
  const finalScore = Math.min(100, Math.max(0, calculatedRisk));

  return {
    dynamicMetadataScore: finalScore,
    isTampered: finalScore >= 40,
    verdict:
      finalScore >= 70
        ? 'CONFIRMED_METADATA_TAMPERING'
        : finalScore >= 40
        ? 'SUSPICIOUS_ANOMALY'
        : 'CLEAN_VERIFIED',
    findingsSummary: findings,
    fieldLevelDiff: fieldDiffs,
    auditTimestamp: new Date().toISOString(),
  };
}

/**
 * Fast client-side metadata reader using native browser APIs
 */
export async function extractClientMetadata(file: File): Promise<SuspectMetadata> {
  const metadata: SuspectMetadata = {
    fileName: file.name,
    fileSizeKB: (file.size / 1024).toFixed(2),
    mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
    lastModified: new Date(file.lastModified).toISOString(),
  };

  const lowerName = file.name.toLowerCase();
  if (lowerName.includes('payslip') || lowerName.includes('payroll')) {
    metadata.documentType = 'PAYSLIP';
  } else if (lowerName.includes('invoice') || lowerName.includes('bill')) {
    metadata.documentType = 'INVOICE';
  } else if (lowerName.includes('statement')) {
    metadata.documentType = 'STATEMENT';
  } else if (lowerName.includes('passport') || lowerName.includes('id') || lowerName.includes('kyc')) {
    metadata.documentType = 'ID_PASSPORT';
  }

  // 1. Read first 4KB to inspect PDF Header Dictionaries
  if (file.type === 'application/pdf' || lowerName.endsWith('.pdf')) {
    try {
      const chunk = await file.slice(0, 8192).text();

      // Extract Producer and Creator via regex from the raw PDF stream
      const producerMatch = chunk.match(/\/Producer\s*\((.*?)\)/i);
      const creatorMatch = chunk.match(/\/Creator\s*\((.*?)\)/i);
      const createDateMatch = chunk.match(/\/CreationDate\s*\(D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/i);
      const modDateMatch = chunk.match(/\/ModDate\s*\(D:(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/i);

      if (producerMatch) metadata.producer = producerMatch[1];
      if (creatorMatch) metadata.creator = creatorMatch[1];

      if (createDateMatch) {
        const [, Y, M, D, h, m, s] = createDateMatch;
        metadata.creationDate = `${Y}-${M}-${D}T${h}:${m}:${s}`;
      }
      if (modDateMatch) {
        const [, Y, M, D, h, m, s] = modDateMatch;
        metadata.modifyDate = `${Y}-${M}-${D}T${h}:${m}:${s}`;
      }
    } catch {
      // Non-blocking fallback
    }
  }

  // 2. Extract image dimensions via HTML Image object
  if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        metadata.width = img.naturalWidth;
        metadata.height = img.naturalHeight;
        URL.revokeObjectURL(objectUrl);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve();
      };
      img.src = objectUrl;
    });
  }

  return metadata;
}
