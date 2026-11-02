import { spawn } from 'child_process';
import path from 'path';

export interface ExtractedResumeData {
  fullName: string;
  email: string;
  education: string;
  specialization: string;
  technicalSkills: string[];
  researchAreas: string[];
  experienceYears: number;
  projects: string[];
  designation?: string;
  organization?: string;
  publications?: string[];
}

export interface ResumeParseResult {
  success: boolean;
  rawText?: string;
  data?: ExtractedResumeData;
  error?: string;
}

/**
 * Invokes the Python PDF resume extraction script and returns structured profile information.
 */
export const parseResumePdf = async (
  filePath: string,
  kind: 'expert' | 'candidate' = 'expert'
): Promise<ResumeParseResult> => {
  return new Promise((resolve) => {
    // Resolve absolute path to the Python script
    const scriptPath = path.resolve(__dirname, '../../python/extract_resume.py');
    const pythonCmd = process.env.PYTHON_PATH || 'python';

    const child = spawn(pythonCmd, [scriptPath, filePath, kind]);

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (chunk) => {
      stdoutData += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderrData += chunk.toString();
    });

    child.on('error', (err) => {
      resolve({
        success: false,
        error: `Failed to spawn Python process: ${err.message}`
      });
    });

    child.on('close', (code) => {
      if (code !== 0 && !stdoutData.trim()) {
        resolve({
          success: false,
          error: stderrData.trim() || `Python process exited with code ${code}`
        });
        return;
      }

      try {
        const parsed = JSON.parse(stdoutData.trim());
        resolve(parsed);
      } catch (err) {
        resolve({
          success: false,
          error: `Failed to parse Python extraction output: ${stdoutData.substring(0, 200)}`
        });
      }
    });
  });
};

