import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { mapObjects } from './mapService';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface MapPayload {
  candidateId: string;
  row: number;
  column: number;
  color?: string;  
  direction?: string;
}

const sendRequestWithRetry = async (
  method: 'POST' | 'DELETE',
  endpoint: string,
  payload: MapPayload
) => {
  while (true) {
    try {
      if (method === 'POST') {
        await axios.post(endpoint, payload);
      } else if (method === 'DELETE') {
        await axios.delete(endpoint, { data: payload });
      }
      return;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        const retryAfter = error.response.headers['retry-after'];
        const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000;
        console.warn(`Rate limit hit. Retrying after ${waitTime / 1000} seconds...`);
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
};

const modifyMapWithGoal = async (
  candidateId: string,
  objectType: string,
  action: 'create' | 'delete'
) => {
  const filteredObjects = mapObjects.filter((obj) => {
    if (objectType === 'polyanets' && obj.type === 'POLYANET') return true;
    if (objectType === 'soloons' && obj.type === 'SOLOON') return true;
    if (objectType === 'comeths' && obj.type === 'COMETH') return true;
    return false;
  });

  for (const obj of filteredObjects) {
    const endpoint = `https://challenge.crossmint.com/api/${objectType}`;
    const payload: MapPayload = {
      candidateId,
      row: obj.coordinates.row,
      column: obj.coordinates.column,
      ...(action === 'create' && obj.type === 'SOLOON' && { color: obj.color }),
      ...(action === 'create' && obj.type === 'COMETH' && { direction: obj.direction }),
    };

    try {
      await sendRequestWithRetry(action === 'create' ? 'POST' : 'DELETE', endpoint, payload);
      console.log(`Successfully ${action === 'create' ? 'posted' : 'deleted'} ${obj.type} at (${obj.coordinates.row}, ${obj.coordinates.column})`);
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new Error(`Failed to ${action === 'create' ? 'post' : 'delete'} ${obj.type} at (${obj.coordinates.row}, ${obj.coordinates.column}): ${errorMessage}`);
    }
  }
};

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