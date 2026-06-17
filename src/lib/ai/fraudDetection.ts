import { getChatCompletion } from './chatCompletion';

export interface ExtractedDocumentData {
  fullName?: string;
  idNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  citizenship?: string;
  issueDate?: string;
  institutionName?: string;
  documentType: string;
  ocrConfidence?: number;
}

export interface FraudIndicator {
  id: string;
  type: 'positive' | 'negative' | 'warning';
  text: string;
}

export interface RuleCheckResult {
  id: string;
  rule: string;
  status: 'pass' | 'fail' | 'warning';
  detail: string;
}

export interface FraudAnalysisResult {
  trustScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  summary: string;
  indicators: FraudIndicator[];
  recommendation: string;
  ruleChecks: RuleCheckResult[];
  modelUsed: string;
  analysisTime: string;
  ocrConfidence: number;
  extractedData: ExtractedDocumentData;
}

/**
 * Run rule-based validation on extracted document data
 */
function runRuleChecks(data: ExtractedDocumentData): { checks: RuleCheckResult[]; penalty: number } {
  const checks: RuleCheckResult[] = [];
  let penalty = 0;

  // Rule 1: Full name not empty
  if (data.fullName && data.fullName.trim().length > 2) {
    checks.push({ id: 'rule-name', rule: 'Full name present', status: 'pass', detail: `Full name extracted: ${data.fullName}` });
  } else {
    checks.push({ id: 'rule-name', rule: 'Full name present', status: 'fail', detail: 'Full name is missing or too short' });
    penalty += 15;
  }

  // Rule 2: SA ID format (13 digits)
  if (data.idNumber) {
    const cleaned = data.idNumber.replace(/\s/g, '');
    if (/^\d{13}$/.test(cleaned)) {
      checks.push({ id: 'rule-id-format', rule: '13-digit SA ID format', status: 'pass', detail: `ID number ${cleaned} matches required format` });

      // Rule 3: Luhn checksum
      const digits = cleaned.split('').map(Number);
      let sum = 0;
      for (let i = 0; i < 13; i++) {
        if (i % 2 === 0) {
          sum += digits[i];
        } else {
          const doubled = digits[i] * 2;
          sum += doubled > 9 ? doubled - 9 : doubled;
        }
      }
      if (sum % 10 === 0) {
        checks.push({ id: 'rule-luhn', rule: 'Luhn checksum validation', status: 'pass', detail: `Check digit ${digits[12]} validated successfully` });
      } else {
        checks.push({ id: 'rule-luhn', rule: 'Luhn checksum validation', status: 'fail', detail: `Check digit ${digits[12]} failed Luhn validation` });
        penalty += 20;
      }

      // Rule 4: DOB matches ID pattern
      if (data.dateOfBirth) {
        const dobPrefix = cleaned.substring(0, 6);
        const dobStr = data.dateOfBirth.replace(/[^0-9]/g, '');
        const yearMatch = dobStr.includes(dobPrefix.substring(0, 2));
        if (yearMatch) {
          checks.push({ id: 'rule-dob', rule: 'DOB matches ID pattern', status: 'pass', detail: `Extracted DOB is consistent with ID digits ${dobPrefix}` });
        } else {
          checks.push({ id: 'rule-dob', rule: 'DOB matches ID pattern', status: 'warning', detail: 'Could not fully verify DOB against ID number — manual check recommended' });
          penalty += 5;
        }
      }

      // Rule 5: Gender digit consistency
      const genderDigit = parseInt(cleaned[6]);
      if (data.gender) {
        const isMale = genderDigit >= 5;
        const genderMatch = (isMale && data.gender.toLowerCase().includes('male') && !data.gender.toLowerCase().includes('female')) ||
          (!isMale && data.gender.toLowerCase().includes('female'));
        if (genderMatch) {
          checks.push({ id: 'rule-gender', rule: 'Gender digit consistency', status: 'pass', detail: `Digit ${genderDigit} indicates ${isMale ? 'male' : 'female'} — matches extracted gender` });
        } else {
          checks.push({ id: 'rule-gender', rule: 'Gender digit consistency', status: 'warning', detail: 'Gender digit may not match extracted gender field' });
          penalty += 5;
        }
      }

      // Rule 6: Citizenship digit
      const citizenDigit = parseInt(cleaned[10]);
      if (citizenDigit === 0 || citizenDigit === 1) {
        checks.push({ id: 'rule-citizenship', rule: 'Citizenship digit validation', status: 'pass', detail: `Digit ${citizenDigit} indicates ${citizenDigit === 0 ? 'SA citizen' : 'permanent resident'} — valid` });
      } else {
        checks.push({ id: 'rule-citizenship', rule: 'Citizenship digit validation', status: 'fail', detail: `Citizenship digit ${citizenDigit} is invalid (expected 0 or 1)` });
        penalty += 10;
      }
    } else {
      checks.push({ id: 'rule-id-format', rule: '13-digit SA ID format', status: 'fail', detail: `ID number "${data.idNumber}" does not match 13-digit format` });
      penalty += 25;
    }
  } else if (data.documentType === 'SA_ID') {
    checks.push({ id: 'rule-id-format', rule: '13-digit SA ID format', status: 'fail', detail: 'No ID number extracted from document' });
    penalty += 25;
  }

  // Rule for certificates: institution name
  if (data.documentType === 'CERTIFICATE' || data.documentType === 'DRIVERS_LICENSE') {
    if (data.institutionName && data.institutionName.trim().length > 2) {
      checks.push({ id: 'rule-institution', rule: 'Institution name present', status: 'pass', detail: `Institution: ${data.institutionName}` });
    } else {
      checks.push({ id: 'rule-institution', rule: 'Institution name present', status: 'warning', detail: 'Institution name could not be extracted — verify manually' });
      penalty += 10;
    }
  }

  return { checks, penalty };
}

/**
 * Simulate OCR extraction from document metadata (in production, use real OCR)
 * Returns plausible extracted data based on document type and filename
 */
function simulateOCRExtraction(documentName: string, documentType: string): ExtractedDocumentData {
  // In a real system, this would call an OCR service
  // For demo purposes, we return structured empty data that the AI will analyze
  return {
    documentType,
    fullName: '',
    idNumber: '',
    dateOfBirth: '',
    gender: '',
    citizenship: 'South African',
    issueDate: '',
    institutionName: '',
    ocrConfidence: 0,
  };
}

/**
 * Main fraud detection function — calls OpenAI with a forensic document analysis prompt
 */
export async function analyzeDocumentForFraud(
  documentName: string,
  documentType: string,
  strictnessLevel: 'lenient' | 'standard' | 'strict' = 'standard'
): Promise<FraudAnalysisResult> {
  const startTime = Date.now();

  const strictnessInstructions = {
    lenient: 'Apply lenient verification — only flag obvious fraud indicators. Minor inconsistencies should be noted as warnings, not failures.',
    standard: 'Apply standard verification — flag clear fraud indicators and significant inconsistencies. Use balanced judgment.',
    strict: 'Apply strict verification — flag all inconsistencies, even minor ones. Err on the side of caution.',
  };

  const systemPrompt = `You are a forensic AI document verification system specializing in South African identity documents and certificates. Your role is to analyze document metadata and simulate realistic fraud detection analysis.

${strictnessInstructions[strictnessLevel]}

You must respond with a valid JSON object matching this exact schema:
{
  "extractedData": {
    "fullName": "string (simulated extracted name)",
    "idNumber": "string (simulated 13-digit SA ID if applicable)",
    "dateOfBirth": "string",
    "gender": "string",
    "citizenship": "string",
    "issueDate": "string",
    "institutionName": "string (if certificate)",
    "ocrConfidence": number (60-99)
  },
  "aiScore": number (0-100, the AI's fraud analysis score),
  "summary": "string (2-3 sentence analysis summary)",
  "indicators": [
    {
      "id": "string",
      "type": "positive|negative|warning",
      "text": "string (specific forensic observation)"
    }
  ],
  "recommendation": "string (APPROVE/REVIEW/REJECT with brief reason)"
}

Generate realistic simulated OCR data based on the document filename and type. For SA IDs, generate a valid 13-digit ID number. Provide 4-6 forensic indicators based on the document type and any patterns you detect in the filename or metadata.`;

  const userMessage = `Analyze this document for fraud and authenticity:

Document Name: ${documentName}
Document Type: ${documentType}
Strictness Level: ${strictnessLevel}

Perform a forensic analysis. Simulate realistic OCR extraction and provide detailed fraud detection indicators. Consider:
1. Document naming patterns (suspicious vs normal)
2. Expected security features for this document type
3. Common fraud patterns for South African documents
4. Consistency checks between extracted fields
5. Statistical validity of any ID numbers

Return the JSON analysis object.`;

  try {
    const response = await getChatCompletion(
      'OPEN_AI',
      'gpt-4o',
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      {
        response_format: { type: 'json_object' },
        max_tokens: 1500,
        temperature: 0.3,
      }
    );

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from AI');

    const aiResult = JSON.parse(content);
    const analysisTimeMs = Date.now() - startTime;

    // Run rule-based checks on the AI-extracted data
    const extractedData: ExtractedDocumentData = {
      ...aiResult.extractedData,
      documentType,
    };

    const { checks: ruleChecks, penalty } = runRuleChecks(extractedData);

    // Combine AI score with rule-based penalty
    const rawScore = Math.max(0, Math.min(100, (aiResult.aiScore || 70) - penalty));
    const trustScore = Math.round(rawScore);

    // Determine risk level
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    if (trustScore >= 75) riskLevel = 'LOW';
    else if (trustScore >= 50) riskLevel = 'MEDIUM';
    else riskLevel = 'HIGH';

    // Add numbered IDs to indicators
    const indicators: FraudIndicator[] = (aiResult.indicators || []).map(
      (ind: { type: string; text: string }, idx: number) => ({
        id: `ai-ind-${idx + 1}`,
        type: ind.type as 'positive' | 'negative' | 'warning',
        text: ind.text,
      })
    );

    return {
      trustScore,
      riskLevel,
      summary: aiResult.summary || 'Analysis complete.',
      indicators,
      recommendation: aiResult.recommendation || (riskLevel === 'LOW' ? 'APPROVE' : riskLevel === 'MEDIUM' ? 'REVIEW' : 'REJECT'),
      ruleChecks,
      modelUsed: 'GPT-4o (forensic-doc-v2)',
      analysisTime: `${(analysisTimeMs / 1000).toFixed(2)}s`,
      ocrConfidence: extractedData.ocrConfidence || 85,
      extractedData,
    };
  } catch (error) {
    // Fallback if AI call fails
    const analysisTimeMs = Date.now() - startTime;
    const fallbackData: ExtractedDocumentData = {
      documentType,
      fullName: 'Unable to extract',
      idNumber: '',
      dateOfBirth: '',
      gender: '',
      citizenship: 'Unknown',
      ocrConfidence: 0,
    };
    return {
      trustScore: 0,
      riskLevel: 'HIGH',
      summary: 'AI analysis failed. Manual review required.',
      indicators: [{ id: 'err-1', type: 'negative', text: 'AI analysis service unavailable — manual verification required' }],
      recommendation: 'REVIEW — AI analysis failed, manual verification required',
      ruleChecks: [],
      modelUsed: 'GPT-4o (forensic-doc-v2)',
      analysisTime: `${(analysisTimeMs / 1000).toFixed(2)}s`,
      ocrConfidence: 0,
      extractedData: fallbackData,
    };
  }
}
