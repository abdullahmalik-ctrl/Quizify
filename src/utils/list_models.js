
import fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        if (!apiKey) {
            throw new Error('Missing GEMINI_API_KEY environment variable.');
        }
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        fs.writeFileSync('models_list.json', JSON.stringify(data, null, 2));
        console.log("Written to models_list.json");
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listModels();
