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

async function fetchGoalGrid() {
    try {
        const response = await axios.get(GOAL_URL);
        return response.data.goal; 
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage =
            (axiosError.response?.data as ErrorResponse)?.message ||
            axiosError.message ||
            'Unknown error occurred while fetching the goal grid';
        console.error(errorMessage);
        throw new Error(errorMessage);                                   // Rethrow to be caught in modifyMapWithGoal
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
                    const deletePromise = new Promise<void>(async resolve => {
                        let attempts = 0;                                           // Track the number of attempts
                        while (attempts < 5) {                                      // Maximum attempts
                            try {
                                await new Promise(r => setTimeout(r, delay));       // Wait for the delay
                                const response = await axios.post(BASE_URL, {
                                    candidateId: CANDIDATE_ID,                      // Directly include these in the request body
                                    row: i,
                                    column: j
                                }, {
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                });
                                console.log(`Successfully posted POLYANET at ${i}, ${j}:`, response.data);
                                resolve();                                          // Resolve the promise after success
                                break;                                              // Exit the loop if successful
                            } catch (error) {
                                const axiosError = error as AxiosError;
                                if (axiosError.response?.status === 429) {
                                    attempts++;
                                    const waitTime = Math.pow(2, attempts) * 100;   // Exponential backoff
                                    console.warn(`Rate limit hit, retrying ${attempts}/5 after ${waitTime}ms...`);
                                    await new Promise(r => setTimeout(r, waitTime)); // Wait before retrying
                                } else {
                                    const errorMessage =
                                        (axiosError.response?.data as ErrorResponse)?.message ||
                                        axiosError.message ||
                                        'Unknown error occurred';
                                    console.error(`Failed to post POLYANET at ${i}, ${j}:`, errorMessage);
                                    resolve();                                      // Resolve the promise on failure
                                    break;                                          // Exit the loop on error
                                }
                            }
                        }
                    });

                    deletePromises.push(deletePromise);                             // Add the promise to the array
                    delay += REQUEST_DELAY;                                         // Increase delay for the next request
                }
            }
        }

        await Promise.all(deletePromises);
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage =
            (axiosError.response?.data as ErrorResponse)?.message ||
            axiosError.message ||
            'Unknown error occurred while modifying the map';
        console.error('Error in modifyMapWithGoal:', errorMessage);
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
                    const deletePromise = new Promise<void>(async resolve => {
                        let attempts = 0;                                       
                        while (attempts < 5) {                                  
                            try {
                                await new Promise(r => setTimeout(r, delay));       
                                const response = await axios.delete(BASE_URL, {
                                    data: {
                                        candidateId: CANDIDATE_ID,
                                        row: i,
                                        column: j
                                    },
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                });
                                console.log(`Successfully deleted POLYANET at ${i}, ${j}:`, response.data);
                                resolve();                                  // Resolve the promise after success
                                break;                                      // Exit the loop if successful
                            } catch (error) {
                                const axiosError = error as AxiosError;
                                if (axiosError.response?.status === 429) {
                                    attempts++;
                                    const waitTime = Math.pow(2, attempts) * 100;              // Exponential backoff
                                    console.warn(`Rate limit hit, retrying ${attempts}/5 after ${waitTime}ms...`);
                                    await new Promise(r => setTimeout(r, waitTime));            // Wait before retrying
                                } else {
                                    const errorMessage =
                                        (axiosError.response?.data as ErrorResponse)?.message ||
                                        axiosError.message ||
                                        'Unknown error occurred';
                                    console.error(`Failed to delete POLYANET at ${i}, ${j}:`, errorMessage);
                                    resolve();                                                  // Resolve the promise on failure
                                    break;                                                      // Exit the loop on error
                                }
                            }
                        }
                    });

                    deletePromises.push(deletePromise);                                         // Add the promise to the array
                    delay += REQUEST_DELAY;                                                     // Increase delay for the next request
                }
            }
        }

        await Promise.all(deletePromises);
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage =
            (axiosError.response?.data as ErrorResponse)?.message ||
            axiosError.message ||
            'Unknown error occurred while modifying the map';
        console.error('Error in modifyMapWithGoal:', errorMessage);
    }
}


app.get('/api/map/680d9354-922c-4978-84fe-f9dd2d45bec7/polyanets', async (_, res) => {
    try {
        await modifyMapWithGoal();
        res.json({ message: "Map modification completed with rate limiting." });
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage =
            (axiosError.response?.data as ErrorResponse)?.message ||
            axiosError.message ||
            'Unknown error occurred while processing the map modification';
        res.status(500).json({ message: errorMessage });
    }
});

app.delete('/api/map/680d9354-922c-4978-84fe-f9dd2d45bec7/polyanets', async (_, res) => {
    try {
        await deletePolyanets();
        res.json({ message: "Map modification completed with rate limiting." });
    } catch (error) {
        const axiosError = error as AxiosError;
        const errorMessage =
            (axiosError.response?.data as ErrorResponse)?.message ||
            axiosError.message ||
            'Unknown error occurred while processing the map modification';
        res.status(500).json({ message: errorMessage });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});