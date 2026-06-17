export interface Position {
  x: number;
  z: number;
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export type TeamColor = 'red' | 'blue' | 'yellow' | 'white' | 'green';

export interface PlayerConfig {
  id: string;
  name: string;
  number: number;
  position: Position;
  team: TeamColor;
  role: 'attacker' | 'defender' | 'goalkeeper' | 'midfielder';
}
