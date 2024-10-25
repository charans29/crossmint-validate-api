import express from 'express';
import axios, { AxiosError } from 'axios';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const GOAL_URL = 'https://challenge.crossmint.com/api/map/680d9354-922c-4978-84fe-f9dd2d45bec7/goal';
const CANDIDATE_ID = "680d9354-922c-4978-84fe-f9dd2d45bec7";
const BASE_URL = "https://challenge.crossmint.io/api/polyanets";
const REQUEST_DELAY = 200;

interface ErrorResponse {
    message: string;
}

// Function to fetch the goal grid from the API
async function fetchGoalGrid() {
    try {
        const response = await axios.get(GOAL_URL);
        return response.data.goal; 
    } catch (error) {
        handleError(error, 'fetching the goal grid');
    }
}

// Generic error handler
function handleError(error: unknown, context: string) {
    const axiosError = error as AxiosError;
    const errorMessage =
        (axiosError.response?.data as ErrorResponse)?.message ||
        axiosError.message ||
        'Unknown error occurred';
    console.error(`Error ${context}:`, errorMessage);
    throw new Error(errorMessage);
}

// Function to send requests with retries and exponential backoff
async function sendRequest(method: 'post' | 'delete', url: string, data: object, delay: number): Promise<void> {
    let attempts = 0;
    while (attempts < 5) {
        try {
            await new Promise(r => setTimeout(r, delay));
            const response = await axios({
                method,
                url,
                data,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(`Successfully ${method === 'post' ? 'posted' : 'deleted'} POLYANET:`, response.data);
            return; // Exit on success
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response?.status === 429) {
                attempts++;
                const waitTime = Math.pow(2, attempts) * 100; // Exponential backoff
                console.warn(`Rate limit hit, retrying ${attempts}/5 after ${waitTime}ms...`);
                await new Promise(r => setTimeout(r, waitTime)); // Wait before retrying
            } else {
                handleError(error, `while ${method === 'post' ? 'posting' : 'deleting'} POLYANET`);
            }
        }
    }
}

async function modifyMapWithGoal() {
    try {
        const goalGrid = await fetchGoalGrid();
        let delay = 0;
        const deletePromises: Promise<void>[] = [];

        for (let i = 0; i < goalGrid.length; i++) {
            for (let j = 0; j < goalGrid[i].length; j++) {
                if (goalGrid[i][j] === "POLYANET") {
                    deletePromises.push(sendRequest('post', BASE_URL, {
                        candidateId: CANDIDATE_ID,
                        row: i,
                        column: j
                    }, delay));
                    delay += REQUEST_DELAY; // Increase delay for the next request
                }
            }
        }
        await Promise.all(deletePromises);
    } catch (error) {
        handleError(error, 'modifying the map');
    }
}

async function deletePolyanets() {
    try {
        const goalGrid = await fetchGoalGrid();
        let delay = 0;
        const deletePromises: Promise<void>[] = [];

        for (let i = 0; i < goalGrid.length; i++) {
            for (let j = 0; j < goalGrid[i].length; j++) {
                if (goalGrid[i][j] === "POLYANET") {
                    deletePromises.push(sendRequest('delete', BASE_URL, {
                        candidateId: CANDIDATE_ID,
                        row: i,
                        column: j
                    }, delay));
                    delay += REQUEST_DELAY; // Increase delay for the next request
                }
            }
        }
        await Promise.all(deletePromises);
    } catch (error) {
        handleError(error, 'deleting polyanets');
    }
}

app.post('/api/map/680d9354-922c-4978-84fe-f9dd2d45bec7/polyanets', async (_, res) => {
    try {
        await modifyMapWithGoal();
        res.json({ message: "Map modification completed with rate limiting." });
    } catch (error) {
        res.status(500).json({ message: "Map modification NOT completed with rate limiting." });
    }
});

app.delete('/api/map/680d9354-922c-4978-84fe-f9dd2d45bec7/polyanets', async (_, res) => {
    try {
        await deletePolyanets();
        res.json({ message: "Map deletion completed with rate limiting." });
    } catch (error) {
        res.status(500).json({ message: "Map deletion NOT completed with rate limiting." });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});