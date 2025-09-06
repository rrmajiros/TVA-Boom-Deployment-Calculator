// This function will be called by your front-end to generate and save a report.
// It securely uses environment variables for your API keys.

// Load the fetch function for Node.js environments
const fetch = require('node-fetch');

// This is the main function that Vercel will run.
module.exports = async (req, res) => {
    // We only accept POST requests.
    if (req.method !== 'POST') {
        res.status(405).json({ message: 'Method Not Allowed' });
        return;
    }

    try {
        // Parse the JSON data sent from the front-end.
        const { current, angle, riverWidth, riverMile, calculatedBoomLength, tension, interval, driftTime, isCascade, segments, anchors, anchorDetailsText } = req.body;
        
        // Use environment variables for API keys and IDs.
        const geminiApiKey = process.env.GEMINI_API_KEY;
        const airtableApiKey = process.env.AIRTABLE_API_KEY;
        const airtableBaseId = process.env.AIRTABLE_BASE_ID;
        const airtableTableId = process.env.AIRTABLE_TABLE_ID;
        
        // Simple validation to ensure we have the necessary data
        if (!airtableApiKey || !airtableBaseId || !airtableTableId || !geminiApiKey) {
            return res.status(500).json({ error: 'Missing environment variables. Please check your Vercel settings.' });
        }

        // Make the API calls.
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;
        const airtableUrl = `https://api.airtable.com/v0/${airtableBaseId}/${airtableTableId}`;
        
        // Re-create the user query for the Gemini API call.
        const userQuery = `Write a detailed operational plan for a deployment report using the following format and data:
        
        Deployment Report
        Prepared for: TVA Emergency Management
        Subject: Geographic Response Strategy for River Mile ${riverMile}
        
        Operational Plan:
        
        Location: River Mile ${riverMile}
        River Width: ${riverWidth} feet
        Drift Time: ${driftTime} seconds
        Current: ${current} knots
        Max Boom Deflection Angle: ${angle} degrees
        Boom Required: ${calculatedBoomLength} feet
        Estimated Tension: ${tension} pounds per 100 ft of boom profile
        Recommended Anchor Interval: ${interval}
        
        ${anchorDetailsText} 
        
        ${isCascade ? `The deployment will utilize a cascade booming system with ${segments} segments.` : ''} The deployment will use a 22-pound Danforth anchor. Please ensure all measurements and values in the report are presented in imperial units (e.g., feet, knots, pounds). Do not include any mention of a diagram, sketch, or formal email headings like "Prepared For" or "Subject" in the report text itself.`;
        
        const systemPrompt = "You are an expert oil spill response specialist. Your task is to write the body of a detailed, professional, and concise deployment report based on the provided data. The body should describe the operational plan, highlight key safety considerations, and explain the physical principles at play. Do not mention that you are an AI or language model. Respond in a formal, informative tone. Do not use an emoji.";
        
        // This is the exponential backoff function from your original code.
        const fetchWithBackoff = async (url, options, retries = 3, delay = 1000) => {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    if (response.status === 429 && retries > 0) {
                        console.log(`Rate limit exceeded. Retrying in ${delay / 1000} seconds...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        return fetchWithBackoff(url, options, retries - 1, delay * 2);
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response;
            } catch (error) {
                if (retries > 0) {
                    console.log(`Fetch error. Retrying in ${delay / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return fetchWithBackoff(url, options, retries - 1, delay * 2);
                }
                throw error;
            }
        };

        // Step 1: Generate the report text
        const geminiResponse = await fetchWithBackoff(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: userQuery }] }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
            })
        });

        const geminiResult = await geminiResponse.json();
        const generatedText = geminiResult?.candidates?.[0]?.content?.parts?.[0]?.text || "Could not generate report. Please try again.";

        // Convert values to the correct type for Airtable
        const currentNum = parseFloat(current);
        const boomLengthNum = parseFloat(calculatedBoomLength);
        const angleNum = parseFloat(angle);
        const anchorsNum = parseFloat(anchors);
        const segmentsNum = parseFloat(segments);
        const riverWidthNum = parseFloat(riverWidth);

        // Correctly parse the interval to be a number for Airtable
        let intervalValueForAirtable;
        if (interval.includes('+')) {
            intervalValueForAirtable = parseFloat(interval.replace('+', ''));
        } else if (interval.includes('per')) {
            intervalValueForAirtable = parseFloat(interval.split(' ')[0]);
        } else {
            intervalValueForAirtable = parseFloat(interval);
        }

        // Step 2: Save the report to Airtable
        const airtablePayload = {
            records: [{
                fields: {
                    'River Mile': riverMile || 'N/A',
                    'Current': isNaN(currentNum) ? null : currentNum,
                    'Boom Required (ft)': isNaN(boomLengthNum) ? null : boomLengthNum,
                    'Angle': isNaN(angleNum) ? null : angleNum,
                    'Tension': tension,
                    'Anchors': isNaN(anchorsNum) ? null : anchorsNum,
                    'Anchor Interval': isNaN(intervalValueForAirtable) ? null : intervalValueForAirtable,
                    'River Width (ft)': isNaN(riverWidthNum) ? null : riverWidthNum,
                    'Drift Time (sec)': driftTime,
                    'Generated Report': generatedText,
                    'Report Date': new Date().toISOString().split('T')[0],
                    'Cascade System?': isCascade,
                    'Segments': isCascade ? segmentsNum : null,
                }
            }]
        };

        await fetchWithBackoff(airtableUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${airtableApiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(airtablePayload),
        });

        // Respond with success and the generated text.
        res.status(200).json({ success: true, message: 'Report generated and saved!', reportText: generatedText });

    } catch (error) {
        console.error('API call failed:', error);
        res.status(500).json({ message: 'Failed to generate or save the report.', error: error.message });
    }
};
