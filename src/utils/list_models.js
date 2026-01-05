
import fs from 'fs';

const apiKey = "AIzaSyCxMU4HO-rCJRr9dwLGdz5p2x3lrjGEs8k";

async function listModels() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();
        fs.writeFileSync('models_list.json', JSON.stringify(data, null, 2));
        console.log("Written to models_list.json");
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listModels();
