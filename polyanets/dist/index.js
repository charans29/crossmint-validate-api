"use strict";
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
const REQUEST_DELAY = 200;
// Function to fetch the goal grid from the API
function fetchGoalGrid() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(GOAL_URL);
            return response.data.goal;
        }
        catch (error) {
            handleError(error, 'fetching the goal grid');
        }
    });
}
// Generic error handler
function handleError(error, context) {
    var _a, _b;
    const axiosError = error;
    const errorMessage = ((_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) ||
        axiosError.message ||
        'Unknown error occurred';
    console.error(`Error ${context}:`, errorMessage);
    throw new Error(errorMessage);
}
// Function to send requests with retries and exponential backoff
function sendRequest(method, url, data, delay) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let attempts = 0;
        while (attempts < 5) {
            try {
                yield new Promise(r => setTimeout(r, delay));
                const response = yield (0, axios_1.default)({
                    method,
                    url,
                    data,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                console.log(`Successfully ${method === 'post' ? 'posted' : 'deleted'} POLYANET:`, response.data);
                return; // Exit on success
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
                    handleError(error, `while ${method === 'post' ? 'posting' : 'deleting'} POLYANET`);
                }
            }
        }
    });
}
function modifyMapWithGoal() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const goalGrid = yield fetchGoalGrid();
            let delay = 0;
            const deletePromises = [];
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
            yield Promise.all(deletePromises);
        }
        catch (error) {
            handleError(error, 'modifying the map');
        }
    });
}
function deletePolyanets() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const goalGrid = yield fetchGoalGrid();
            let delay = 0;
            const deletePromises = [];
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
            yield Promise.all(deletePromises);
        }
        catch (error) {
            handleError(error, 'deleting polyanets');
        }
    });
}
app.post('/api/map/680d9354-922c-4978-84fe-f9dd2d45bec7/polyanets', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield modifyMapWithGoal();
        res.json({ message: "Map modification completed with rate limiting." });
    }
    catch (error) {
        res.status(500).json({ message: "Map modification NOT completed with rate limiting." });
    }
}));
app.delete('/api/map/680d9354-922c-4978-84fe-f9dd2d45bec7/polyanets', (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield deletePolyanets();
        res.json({ message: "Map deletion completed with rate limiting." });
    }
    catch (error) {
        res.status(500).json({ message: "Map deletion NOT completed with rate limiting." });
    }
}));
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
