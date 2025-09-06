// This serverless function handles the API calls to Google AI and Airtable.
// It receives data from the front-end calculator, generates a report using
// the Gemini model, and saves the report to the Airtable database.

// IMPORTANT: Set these environment variables in your Vercel project settings.
// GOOGLE_API_KEY: Your Google AI API key.
// AIRTABLE_API_KEY: Your Airtable API key.
// AIRTABLE_BASE_ID: The ID of your Airtable base.
// AIRTABLE_TABLE_ID: The ID of your Airtable table.

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID;

// Define the API URLs
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

// Helper function for exponential backoff
const exponentialBackoff = async (func, maxRetries = 5, delay = 1000) => {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await func();
        } catch (error) {
            if (i < maxRetries - 1) {
                await new Promise(res => setTimeout(res, delay * (2 ** i)));
            } else {
                throw error;
            }
        }
    }
};

// Vercel serverless function handler
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const {
            current,
            angle,
            riverWidth,
            riverMile,
            calculatedBoomLength,
            tension,
            interval,
            driftTime,
            isCascade,
            segments,
            anchors,
            anchorDetailsText
        } = req.body;

        // Step 1: Generate report text using Google AI with search grounding.
        const prompt = `
            You are a subject matter expert on boom deployment for environmental response.
            Your task is to generate a professional, concise, and easy-to-read report
            on a geographic response strategy for a diesel fuel spill.

            The report should be a single, well-structured paragraph that includes the following information:
            - A professional salutation.
            - A summary of the deployment conditions (river mile, current, river width, boom angle, drift time if available).
            - The calculated boom length required and the estimated tension.
            - The recommended anchor interval and total number of anchors.
            - A clear recommendation on whether a single boom or a cascade booming system is required, and if so, how many segments.
            - A professional closing.

            Here are the details for the report:
            - River Mile: ${riverMile || 'Not specified'}
            - River Current: ${current} knots
            - River Width: ${riverWidth} ft
            - Boom Angle: ${angle} degrees
            - Calculated Boom Length: ${calculatedBoomLength} ft
            - Estimated Tension: ${tension} lbs
            - Recommended Anchor Interval: ${interval}
            - Drift Time (for 100ft): ${driftTime || 'Not measured'} seconds
            - Is Cascade Booming System Recommended?: ${isCascade ? 'Yes' : 'No'}
            - Total segments (if cascade): ${isCascade ? segments : 1}
            - Total anchors required: ${anchors}
            - Anchor details: ${anchorDetailsText}
            - Spill Type: Diesel Fuel
            - Location: Tennessee Valley Authority waterway
        `;

        const googleAiPayload = {
            contents: [{ parts: [{ text: prompt }] }],
            tools: [{ "google_search": {} }],
            systemInstruction: {
                parts: [{ text: "Act as an expert environmental response consultant. Provide a concise, single-paragraph report based on the provided data." }]
            }
        };

        const googleAiResponse = await exponentialBackoff(async () => {
            return fetch(`${GOOGLE_AI_API_URL}?key=${GOOGLE_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(googleAiPayload)
            });
        });

        const googleAiResult = await googleAiResponse.json();
        const generatedText = googleAiResult.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
            throw new Error('Failed to generate report text from Google AI.');
        }

        // Step 2: Save the generated report to Airtable.
        const airtablePayload = {
            records: [{
                fields: {
                    "Report": generatedText,
                    "Current": parseFloat(current),
                    "Angle": parseFloat(angle),
                    "River Width": parseFloat(riverWidth),
                    "River Mile": riverMile,
                    "Boom Length": parseFloat(calculatedBoomLength),
                    "Seg Length": parseFloat(calculatedBoomLength / segments),
                    "Anchor Interval": parseInt(interval),
                    "Drift Time": parseFloat(driftTime) || null,
                    
                    "Segments": isCascade ? segments : 1,
                    "Anchors": anchors,
                }
            }]
        };

        const airtableResponse = await exponentialBackoff(async () => {
            return fetch(AIRTABLE_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(airtablePayload)
            });
        });

        if (!airtableResponse.ok) {
            const errorText = await airtableResponse.text();
            throw new Error(`Failed to save report to Airtable: ${airtableResponse.status} ${airtableResponse.statusText} - ${errorText}`);
        }

        res.status(200).json({ reportText: generatedText });

    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ message: 'An unexpected error occurred.', error: error.message });
    }
}
