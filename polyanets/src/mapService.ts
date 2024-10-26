import { MapObject, Coordinates, Polyanet, Soloon, Cometh } from './types';
import axios from 'axios';

let mapObjects: MapObject[] = [];
const CANDIDATE_ID = '680d9354-922c-4978-84fe-f9dd2d45bec7';

const loadMapData = async () => {
  try {
    const response = await axios.get(`https://challenge.crossmint.com/api/map/${CANDIDATE_ID}/goal`);
    const goalData: string[][] = response.data.goal;

    mapObjects = goalData.flatMap((row, rowIndex) =>
      row.flatMap((cell, columnIndex) => {
        const coordinates: Coordinates = { row: rowIndex, column: columnIndex };

        if (cell === 'POLYANET') {
          return { type: 'POLYANET', coordinates } as Polyanet;
        } else if (['RED_SOLOON', 'BLUE_SOLOON', 'WHITE_SOLOON', 'PURPLE_SOLOON'].includes(cell)) {
          const color = cell.split('_')[0].toLowerCase() as Soloon['color'];
          return { type: 'SOLOON', color, coordinates } as Soloon;
        } else if (['RIGHT_COMETH', 'LEFT_COMETH', 'UP_COMETH', 'DOWN_COMETH'].includes(cell)) {
          const direction = cell.split('_')[0].toLowerCase() as Cometh['direction'];
          return { type: 'COMETH', direction, coordinates } as Cometh;
        } else {
          return [];
        }
      })
    );

    // console.log('Map data loaded successfully:', mapObjects);
  } catch (error) {
    console.error('Failed to load map data:');
  }
};

loadMapData();

export { mapObjects };