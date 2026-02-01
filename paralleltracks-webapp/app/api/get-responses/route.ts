import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';

export async function GET() {
  // Path to the Python script
  const pythonScriptPath = path.resolve(process.cwd(), 'backend', 'main.py');

  // Wrap the spawn in a Promise to handle async execution
  const getResponses = () => new Promise<string>((resolve, reject) => {
    const pythonProcess = spawn('python', [pythonScriptPath]);

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`Python script exited with code ${code}`);
        console.error(stderr);
        reject(new Error(`Python script error: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    pythonProcess.on('error', (err) => {
        console.error('Failed to start Python process.');
        reject(err);
    });
  });

  try {
    const responsesJson = await getResponses();
    const responses = JSON.parse(responsesJson);
    return NextResponse.json(responses);
  } catch (error) {
    console.error('Error getting responses:', error);
    return NextResponse.json({ error: 'Failed to get responses from AI models' }, { status: 500 });
  }
}
