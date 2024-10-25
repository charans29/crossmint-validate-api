"use strict";
// import express from 'express';
// import axios from 'axios';
// import cors from 'cors';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// const app = express();
// const PORT = 3000;
// app.use(cors());
// app.use(express.json());
// const GOAL_URL = 'https://challenge.crossmint.com/api/map/680d9354-922c-4978-84fe-f9dd2d45bec7/goal';
// const CANDIDATE_ID = "680d9354-922c-4978-84fe-f9dd2d45bec7";
// const BASE_URL = "https://challenge.crossmint.io/api/polyanets";
// async function fetchGoalGrid() {
//     const response = await axios.get(GOAL_URL);
//     return response.data.goal;
// }
// async function mapPolyanets() {
//     try {
//         const goalGrid = await fetchGoalGrid();
//         for (let i = 0; i < goalGrid.length; i++) {
//             for (let j = 0; j < goalGrid[i].length; j++) {
//                 if (goalGrid[i][j] === "POLYANET") {
//                     await axios.delete(`${BASE_URL}`, {
//                         params: {
//                             candidateId: CANDIDATE_ID,
//                             row: i,
//                             column: j
//                         }
//                     });
//                 }
//             }
//         }
//     } catch (error) {
//         console.error("Error mapping Polyanets:", error);
//     }
// }
// app.get('/api/map/680d9354-922c-4978-84fe-f9dd2d45bec7/polyanets', (_, res) => {
//     mapPolyanets();
//     res.json({ message: "Mapping Polyanets" });
// });
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });
// import express from 'express';
// import axios from 'axios';
// import cors from 'cors';
// const app = express();
// const PORT = 3000;
// app.use(cors());
// app.use(express.json());
// const GOAL_URL = 'https://challenge.crossmint.com/api/map/680d9354-922c-4978-84fe-f9dd2d45bec7/goal';
// const CANDIDATE_ID = "680d9354-922c-4978-84fe-f9dd2d45bec7";
// const BASE_URL = "https://challenge.crossmint.io/api/polyanets";
// const REQUEST_DELAY = 200; // 200ms delay between each request
// async function fetchGoalGrid() {
//     const response = await axios.get(GOAL_URL);
//     return response.data.goal;
// }
// function modifyMapWithGoal() {
//     fetchGoalGrid().then(goalGrid => {
//         let delay = 0;
//         for (let i = 0; i < goalGrid.length; i++) {
//             for (let j = 0; j < goalGrid[i].length; j++) {
//                 if (goalGrid[i][j] === "POLYANET") {
//                     setTimeout(() => {
//                         axios.post(BASE_URL, {
//                             candidateId: CANDIDATE_ID,
//                             row: i,
//                             column: j
//                         }).catch(error => 
//                             console.error(`Failed to update map at ${i}, ${j}:`, error.message)
//                         );
//                     }, delay);
//                     delay += REQUEST_DELAY; // Increase delay for next request
//                 }
//             }
//         }
//     }).catch(error => console.error('Failed to fetch goal grid:', error.message));
// }
// app.get('/api/map/680d9354-922c-4978-84fe-f9dd2d45bec7/polyanets', (req, res) => {
//     modifyMapWithGoal();
//     res.json({ message: "Map modification initiated with rate limiting." });
// });
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const GOAL_URL = 'https://challenge.crossmint.com/api/map/680d9354-922c-4978-84fe-f9dd2d45bec7/goal';
const CANDIDATE_ID = "680d9354-922c-4978-84fe-f9dd2d45bec7";
const BASE_URL = "https://challenge.crossmint.io/api/polyanets";
const REQUEST_DELAY = 200; // 200ms delay between each request
function fetchGoalGrid() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const response = yield axios_1.default.get(GOAL_URL);
            return response.data.goal; // Adjust based on your API's actual response structure
        }
        catch (error) {
            // Assert that error is an AxiosError
            const axiosError = error;
            const errorMessage = ((_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                axiosError.message ||
                'Unknown error occurred while fetching the goal grid';
            console.error(errorMessage);
            throw new Error(errorMessage); // Rethrow to be caught in modifyMapWithGoal
        }
    });
}
function modifyMapWithGoal() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const goalGrid = yield fetchGoalGrid();
            let delay = 0;
            const deletePromises = [];
            for (let i = 0; i < goalGrid.length; i++) {
                for (let j = 0; j < goalGrid[i].length; j++) {
                    if (goalGrid[i][j] === "POLYANET") {
                        const deletePromise = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                            var _a, _b, _c;
                            let attempts = 0; // Track the number of attempts
                            while (attempts < 5) { // Maximum attempts
                                try {
                                    yield new Promise(r => setTimeout(r, delay)); // Wait for the delay
                                    const response = yield axios_1.default.post(BASE_URL, {
                                        candidateId: CANDIDATE_ID, // Directly include these in the request body
                                        row: i,
                                        column: j
                                    }, {
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                    });
                                    console.log(`Successfully posted POLYANET at ${i}, ${j}:`, response.data);
                                    resolve(); // Resolve the promise after success
                                    break; // Exit the loop if successful
                                }
                                catch (error) {
                                    const axiosError = error;
                                    if (((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) === 429) {
                                        attempts++;
                                        const waitTime = Math.pow(2, attempts) * 100; // Exponential backoff
                                        console.warn(`Rate limit hit, retrying ${attempts}/5 after ${waitTime}ms...`);
                                        yield new Promise(r => setTimeout(r, waitTime)); // Wait before retrying
                                    }
                                    else {
                                        const errorMessage = ((_c = (_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) ||
                                            axiosError.message ||
                                            'Unknown error occurred';
                                        console.error(`Failed to post POLYANET at ${i}, ${j}:`, errorMessage);
                                        resolve(); // Resolve the promise on failure
                                        break; // Exit the loop on error
                                    }
                                }
                            }
                        }));
                        deletePromises.push(deletePromise); // Add the promise to the array
                        delay += REQUEST_DELAY; // Increase delay for the next request
                    }
                }
            }
            yield Promise.all(deletePromises);
        }
        catch (error) {
            const axiosError = error;
            const errorMessage = ((_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                axiosError.message ||
                'Unknown error occurred while modifying the map';
            console.error('Error in modifyMapWithGoal:', errorMessage);
        }
    });
}
function deletePolyanets() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const goalGrid = yield fetchGoalGrid();
            let delay = 0;
            const deletePromises = [];
            for (let i = 0; i < goalGrid.length; i++) {
                for (let j = 0; j < goalGrid[i].length; j++) {
                    if (goalGrid[i][j] === "POLYANET") {
                        const deletePromise = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                            var _a, _b, _c;
                            let attempts = 0; // Track the number of attempts
                            while (attempts < 5) { // Maximum attempts
                                try {
                                    yield new Promise(r => setTimeout(r, delay)); // Wait for the delay
                                    const response = yield axios_1.default.delete(BASE_URL, {
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
                                    resolve(); // Resolve the promise after success
                                    break; // Exit the loop if successful
                                }
                                catch (error) {
                                    const axiosError = error;
                                    if (((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status) === 429) {
                                        attempts++;
                                        const waitTime = Math.pow(2, attempts) * 100; // Exponential backoff
                                        console.warn(`Rate limit hit, retrying ${attempts}/5 after ${waitTime}ms...`);
                                        yield new Promise(r => setTimeout(r, waitTime)); // Wait before retrying
                                    }
                                    else {
                                        const errorMessage = ((_c = (_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) ||
                                            axiosError.message ||
                                            'Unknown error occurred';
                                        console.error(`Failed to delete POLYANET at ${i}, ${j}:`, errorMessage);
                                        resolve(); // Resolve the promise on failure
                                        break; // Exit the loop on error
                                    }
                                }
                            }
                        }));
                        deletePromises.push(deletePromise); // Add the promise to the array
                        delay += REQUEST_DELAY; // Increase delay for the next request
                    }
                }
            }
            yield Promise.all(deletePromises);
        }
        catch (error) {
            const axiosError = error;
            const errorMessage = ((_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
                axiosError.message ||
                'Unknown error occurred while modifying the map';
            console.error('Error in modifyMapWithGoal:', errorMessage);
        }
    });
}
app.get('/api/map/680d9354-922c-4978-84fe-f9dd2d45bec7/polyanets', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        yield modifyMapWithGoal();
        res.json({ message: "Map modification completed with rate limiting." });
    }
    catch (error) {
        const axiosError = error;
        const errorMessage = ((_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
            axiosError.message ||
            'Unknown error occurred while processing the map modification';
        res.status(500).json({ message: errorMessage });
    }
}));
app.delete('/api/map/680d9354-922c-4978-84fe-f9dd2d45bec7/polyanets', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        yield deletePolyanets();
        res.json({ message: "Map modification completed with rate limiting." });
    }
    catch (error) {
        const axiosError = error;
        const errorMessage = ((_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
            axiosError.message ||
            'Unknown error occurred while processing the map modification';
        res.status(500).json({ message: errorMessage });
    }
}));
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
