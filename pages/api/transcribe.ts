// pages/api/transcribe.ts
import {NextApiRequest, NextApiResponse} from 'next';
import {IncomingForm} from 'formidable-serverless';
import fs from 'fs';
import path from 'path';
import {OpenAI} from 'openai';

export const config = {
    api: {
        bodyParser: false, // Important: disable Next's default body parser
    },
};

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    return new Promise((resolve, reject) => {
        const form = new IncomingForm({
            multiples: false,
            keepExtensions: true
        });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('[Upload error]', err);
                res.status(500).json({error: 'Upload failed'});
                return resolve(undefined);
            }

            const file = files.audio;
            if (!file || Array.isArray(file)) {
                res.status(400).json({error: 'Missing or invalid file'});
                return resolve(undefined);
            }

            try {
                const filePath = file.path;
                const fileType = file.type || 'audio/webm';

                console.log('[File info]', {
                    path: filePath,
                    type: fileType,
                    name: file.name,
                    size: file.size
                });

                // Create a temporary file with the correct extension
                const tempDir = path.dirname(filePath);
                const fileExtension = '.webm';  // Force .webm extension
                const newPath = path.join(tempDir, `recording${fileExtension}`);

                // Copy the file with the correct extension
                fs.copyFileSync(filePath, newPath);
                console.log('[Created file with extension]', newPath);

                const response = await openai.audio.transcriptions.create({
                    file: fs.createReadStream(newPath),
                    model: 'whisper-1',
                });

                // Clean up temp file
                try {
                    fs.unlinkSync(newPath);
                } catch (e) {
                    console.error('[Cleanup error]', e);
                }

                res.status(200).json({text: response.text});
                return resolve(undefined);
            } catch (error: any) {
                console.error('[Whisper API error]', error);
                res.status(500).json({
                    error: 'Transcription failed',
                    details: error.message,
                    type: error.type
                });
                return resolve(undefined);
            }
        });
    });
}