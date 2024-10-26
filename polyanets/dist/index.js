"use strict";
// import express from 'express';
// import axios from 'axios';
// import cors from 'cors';
// import { mapObjects } from './mapService';
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
// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
// const sendRequestWithRetry = async (endpoint: string, payload: any) => {
//     while (true) {
//       try {
//         await axios.post(endpoint, payload);
//         return;
//       } catch (error) {
//         if (axios.isAxiosError(error) && error.response?.status === 429) {
//           const retryAfter = error.response.headers['retry-after'];
//           const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000;
//           console.warn(`Rate limit hit. Retrying after ${waitTime / 1000} seconds...`);
//           await delay(waitTime);
//         } else {
//           throw error;
//         }
//       }
//     }
//   };
// const modifyMapWithGoal = async (candidateId: string, objectType: string) => {
//     const filteredObjects = mapObjects.filter((obj) => {
//       if (objectType === 'polyanets' && obj.type === 'POLYANET') return true;
//       if (objectType === 'soloons' && obj.type === 'SOLOON') return true;
//       if (objectType === 'comeths' && obj.type === 'COMETH') return true;
//       return false;
//     });
//     //  console.log("FILTER OB JECTS:-", filteredObjects)
//     for (const obj of filteredObjects) {
//       const endpoint = `https://challenge.crossmint.com/api/${objectType}`;
//       const payload = {
//         candidateId,
//         row: obj.coordinates.row,
//         column: obj.coordinates.column,
//         ...(obj.type === 'SOLOON' && { color: obj.color }),
//         ...(obj.type === 'COMETH' && { direction: obj.direction })
//       };
//       try {
//         await sendRequestWithRetry(endpoint, payload);
//         console.log(`Successfully posted ${obj.type} at (${obj.coordinates.row}, ${obj.coordinates.column})`);
//       } catch (error) {
//         const errorMessage = (error as Error).message;
//         throw new Error(`Failed to post ${obj.type} at (${obj.coordinates.row}, ${obj.coordinates.column}): ${errorMessage}`);
//       }
//     }
//   };
// app.post('/api/map/:candidateId/:object', (req, res) => {
//     const { candidateId, object } = req.params;
//     modifyMapWithGoal(candidateId, object)
//         .then(() => res.status(201).send(`${object} created`))
//         .catch(err => res.status(400).send(err.message));
// });
// app.delete('/api/map/:candidateId/:object', (req, res) => {
//     const { candidateId, object } = req.params;
//     modifyMapWithGoal(candidateId, object)
//     .then(() => res.status(201).send(`${object} deleted`))
//     .catch(err => res.status(400).send(err.message));
// });
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const mapService_1 = require("./mapService");
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const sendRequestWithRetry = (method, endpoint, payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    while (true) {
        try {
            if (method === 'POST') {
                yield axios_1.default.post(endpoint, payload);
            }
            else if (method === 'DELETE') {
                yield axios_1.default.delete(endpoint, { data: payload });
            }
            return;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 429) {
                const retryAfter = error.response.headers['retry-after'];
                const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000;
                console.warn(`Rate limit hit. Retrying after ${waitTime / 1000} seconds...`);
                yield delay(waitTime);
            }
            else {
                throw error;
            }
        }
    }
});
const modifyMapWithGoal = (candidateId, objectType, action) => __awaiter(void 0, void 0, void 0, function* () {
    const filteredObjects = mapService_1.mapObjects.filter((obj) => {
        if (objectType === 'polyanets' && obj.type === 'POLYANET')
            return true;
        if (objectType === 'soloons' && obj.type === 'SOLOON')
            return true;
        if (objectType === 'comeths' && obj.type === 'COMETH')
            return true;
        return false;
    });
    for (const obj of filteredObjects) {
        const endpoint = `https://challenge.crossmint.com/api/${objectType}`;
        const payload = Object.assign(Object.assign({ candidateId, row: obj.coordinates.row, column: obj.coordinates.column }, (action === 'create' && obj.type === 'SOLOON' && { color: obj.color })), (action === 'create' && obj.type === 'COMETH' && { direction: obj.direction }));
        try {
            yield sendRequestWithRetry(action === 'create' ? 'POST' : 'DELETE', endpoint, payload);
            console.log(`Successfully ${action === 'create' ? 'posted' : 'deleted'} ${obj.type} at (${obj.coordinates.row}, ${obj.coordinates.column})`);
        }
        catch (error) {
            const errorMessage = error.message;
            throw new Error(`Failed to ${action === 'create' ? 'post' : 'delete'} ${obj.type} at (${obj.coordinates.row}, ${obj.coordinates.column}): ${errorMessage}`);
        }
    }
});
app.post('/api/map/:candidateId/:object', (req, res) => {
    const { candidateId, object } = req.params;
    modifyMapWithGoal(candidateId, object, 'create')
        .then(() => res.status(201).send(`${object} created`))
        .catch(err => res.status(400).send(err.message));
});
app.delete('/api/map/:candidateId/:object', (req, res) => {
    const { candidateId, object } = req.params;
    modifyMapWithGoal(candidateId, object, 'delete')
        .then(() => res.status(200).send(`${object} deleted`))
        .catch(err => res.status(400).send(err.message));
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
