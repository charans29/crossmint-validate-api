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
exports.mapObjects = void 0;
const axios_1 = __importDefault(require("axios"));
let mapObjects = [];
exports.mapObjects = mapObjects;
const CANDIDATE_ID = '680d9354-922c-4978-84fe-f9dd2d45bec7';
const loadMapData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(`https://challenge.crossmint.com/api/map/${CANDIDATE_ID}/goal`);
        const goalData = response.data.goal;
        exports.mapObjects = mapObjects = goalData.flatMap((row, rowIndex) => row.flatMap((cell, columnIndex) => {
            const coordinates = { row: rowIndex, column: columnIndex };
            if (cell === 'POLYANET') {
                return { type: 'POLYANET', coordinates };
            }
            else if (['RED_SOLOON', 'BLUE_SOLOON', 'WHITE_SOLOON', 'PURPLE_SOLOON'].includes(cell)) {
                const color = cell.split('_')[0].toLowerCase();
                return { type: 'SOLOON', color, coordinates };
            }
            else if (['RIGHT_COMETH', 'LEFT_COMETH', 'UP_COMETH', 'DOWN_COMETH'].includes(cell)) {
                const direction = cell.split('_')[0].toLowerCase();
                return { type: 'COMETH', direction, coordinates };
            }
            else {
                return [];
            }
        }));
        // console.log('Map data loaded successfully:', mapObjects);
    }
    catch (error) {
        console.error('Failed to load map data:');
    }
});
loadMapData();
