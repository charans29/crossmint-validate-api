export interface Coordinates {
    row: number;
    column: number;
}

export interface Polyanet {
    type: 'POLYANET';
    coordinates: Coordinates;
}

export interface Soloon {
    type: 'SOLOON';
    color: 'RED' | 'BLUE' | 'WHITE' | 'PURPLE';
    coordinates: Coordinates;
}

export interface Cometh {
    type: 'COMETH';
    direction: 'RIGHT' | 'LEFT' | 'UP' | 'DOWN';
    coordinates: Coordinates;
}

export type MapObject = Polyanet | Soloon | Cometh;