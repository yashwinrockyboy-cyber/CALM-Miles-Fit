import { CrimeZone } from '../types';

export const AVOIDED_CRIME_ZONES: CrimeZone[] = [
  {
    name: 'Isolated Golden Rock Outer Goods Yard & Dark Underpass',
    reason: 'Unlit, isolated after sunset, past reports of purse snatching and anti-social loitering.',
    lat: 10.785,
    lon: 78.718,
    radiusMeters: 450
  },
  {
    name: 'Ariyamangalam Desolate Canal Perimeter',
    reason: 'Heavy garbage traffic, lack of streetlights, deserted pedestrian pathway.',
    lat: 10.789,
    lon: 78.735,
    radiusMeters: 500
  },
  {
    name: 'NH45 Semi-Ring Highway Flyover Ramp',
    reason: 'High-speed heavy container trucks, lack of pedestrian barriers or cycle lanes.',
    lat: 10.768,
    lon: 78.745,
    radiusMeters: 400
  },
  {
    name: 'Cauvery River Desolate Sandbar Track',
    reason: 'Remote, zero lighting, unmonitored at night, unsafe for solo walkers.',
    lat: 10.842,
    lon: 78.678,
    radiusMeters: 600
  }
];
