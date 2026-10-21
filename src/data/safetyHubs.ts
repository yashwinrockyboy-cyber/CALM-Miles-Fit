import { SafeHub } from '../types';

export const SAFE_HUBS: SafeHub[] = [
  {
    id: 'safe-gh-trichy',
    name: 'Mahatma Gandhi Govt Memorial Hospital (GH) & 108 Ambulance Hub',
    type: 'hospital',
    lat: 10.8021,
    lon: 78.6755,
    address: 'Collector Office Road, Cantonment, Trichy',
    description: 'Central 24/7 Government Trauma Center with 108 Emergency Ambulance Station on site.',
    phone: '0431-2701201'
  },
  {
    id: 'safe-cantonment-post',
    name: 'Cantonment Community Safety Post & Emergency First-Aid',
    type: 'school_safe_zone',
    lat: 10.8038,
    lon: 78.6719,
    address: 'Maris Avenue & Bharathi Nagar, Cantonment',
    description: 'Pedestrian safety zone with security kiosk, emergency beacon, and direct dispatch to 108 Ambulance.',
    phone: '108'
  },
  {
    id: 'safe-police-cantonment',
    name: 'Cantonment Police Station & Patrol Booth',
    type: 'police',
    lat: 10.796,
    lon: 78.682,
    address: 'Collectorate Road, Cantonment',
    description: 'Central Trichy city police post with active mobile patrols and emergency assistance.',
    phone: '112'
  },
  {
    id: 'safe-police-thillai',
    name: 'Thillai Nagar Police Checkpost',
    type: 'police',
    lat: 10.82,
    lon: 78.681,
    address: 'Thillai Nagar Main Road, West Trichy',
    description: 'Illuminated police assistance booth with women & citizen safety kiosk.',
    phone: '112'
  },
  {
    id: 'safe-police-srirangam',
    name: 'Srirangam Temple Police Station',
    type: 'police',
    lat: 10.861,
    lon: 78.6915,
    address: 'South Chithirai Street, Srirangam',
    description: 'Pedestrian safety assistance zone with 360-degree security cameras.',
    phone: '112'
  },
  {
    id: 'safe-police-junction',
    name: 'Railway Junction Police Aid Post',
    type: 'police',
    lat: 10.7938,
    lon: 78.685,
    address: 'TPJ Railway Station Plaza',
    description: 'Lit transit hub with railway security, city police presence, and 24/7 medical booth.',
    phone: '112'
  },
  {
    id: 'safe-hospital-apollo',
    name: 'Apollo Hospital 24/7 Emergency & Ambulance Hub',
    type: 'hospital',
    lat: 10.8162,
    lon: 78.683,
    address: 'Salai Road, Trichy',
    description: '24/7 emergency trauma center with advanced cardiac ambulance dispatch.',
    phone: '1066'
  },
  {
    id: 'safe-hospital-kauvery',
    name: 'Kauvery Hospital 24/7 Emergency & Ambulance Hub',
    type: 'hospital',
    lat: 10.8142,
    lon: 78.6835,
    address: 'Tennur High Road & Cantonment, Trichy',
    description: 'Round-the-clock emergency hospital with ICU-on-wheels ambulance fleet.',
    phone: '0431-4000600'
  },
  {
    id: 'safe-corridor-thillai',
    name: 'Thillai Nagar Green Cycle Corridor',
    type: 'lit_corridor',
    lat: 10.8195,
    lon: 78.6795,
    address: '1st to 11th Cross Roads',
    description: 'Tree-lined, LED-illuminated pedestrian walkways and calm neighborhood streets.'
  },
  {
    id: 'safe-corridor-collectorate',
    name: 'Collector\'s Office Road & Maris Avenue Safe Corridor',
    type: 'lit_corridor',
    lat: 10.8015,
    lon: 78.6725,
    address: 'Maris Avenue & Officers Colony',
    description: 'Wide, well-lit sidewalks and speed-calmed residential avenues with continuous street lighting.'
  }
];
