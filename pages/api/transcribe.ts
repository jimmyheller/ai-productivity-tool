// pages/api/transcribe.ts
import {NextApiRequest, NextApiResponse} from 'next';
import {IncomingForm} from 'formidable-serverless';
import fs from 'fs';
import {OpenAI} from 'openai';

export const config = {
    api: {
        bodyParser: false, // Important: disable Next's default body parser
    },
};

const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const form = new IncomingForm({multiples: false});

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('[Upload error]', err);
            return res.status(500).json({error: 'Upload failed'});
        }

        const file = files.audio;
        if (!file || Array.isArray(file)) {
            return res.status(400).json({error: 'Missing or invalid file'});
        }

        const tempPath = file.filepath; // 'filepath' contains the path to the uploaded file
        const newPath = `${tempPath}.webm`; // Append the correct extension

        fs.rename(tempPath, newPath, (renameErr) => {
            if (renameErr) {
                console.error('Error renaming the file', renameErr);
                return res.status(500).json({error: 'Error processing the uploaded file'});
            }

            try {
                const response = await openai.audio.transcriptions.create({
                    file: {
                        value: fs.createReadStream(file.path),
                        options: {
                            filename: 'recording.webm',
                            contentType: file.type || 'audio/webm',
                        },
                    },
                    model: 'whisper-1',
                });

                return res.status(200).json({text: response.text});
            } catch (error: any) {
                console.error('[Whisper API error]', error);
                return res.status(500).json({error: 'Transcription failed'});
            }

        });
    });
}
