export interface AmbulanceContact {
  id: string;
  name: string;
  shortName: string;
  phone: string;
  displayPhone: string;
  type: 'Govt Free' | 'Trauma / Critical' | 'Multi-Speciality' | 'Maternity / Child';
  available: string;
  avgResponseTime: string;
  location: string;
  lat: number;
  lon: number;
  description: string;
  isPrimary?: boolean;
}

export const AMBULANCE_CONTACTS: AmbulanceContact[] = [
  {
    id: 'amb-108',
    name: '108 Tamil Nadu Emergency Ambulance Service',
    shortName: '108 National Ambulance',
    phone: '108',
    displayPhone: '108',
    type: 'Govt Free',
    available: '24/7 Free Emergency',
    avgResponseTime: '8 - 12 mins',
    location: 'Citywide Dispatch (Trichy Network)',
    lat: 10.8038,
    lon: 78.6719,
    description: 'Toll-free 24x7 government emergency medical service equipped with basic & advanced life support across Tiruchirappalli.',
    isPrimary: true
  },
  {
    id: 'amb-112',
    name: '112 National Integrated Emergency Helpline',
    shortName: '112 Unified Emergency',
    phone: '112',
    displayPhone: '112',
    type: 'Govt Free',
    available: '24/7 Unified Dispatch',
    avgResponseTime: '7 - 10 mins',
    location: 'District Emergency Command Center',
    lat: 10.796,
    lon: 78.682,
    description: 'Single unified emergency helpline connecting medical ambulance, police dispatch, and fire rescue teams instantly.',
    isPrimary: true
  },
  {
    id: 'amb-gh',
    name: 'Mahatma Gandhi Memorial Govt Hospital (GH) Ambulance',
    shortName: 'GH Trichy Ambulance',
    phone: '04312701201',
    displayPhone: '0431-2701201',
    type: 'Govt Free',
    available: '24/7 Trauma Care',
    avgResponseTime: '10 - 15 mins',
    location: 'Collector Office Road, Cantonment',
    lat: 10.8021,
    lon: 78.6755,
    description: 'Trichy government medical college hospital trauma center ambulance unit with ICU on wheels capability.',
    isPrimary: true
  },
  {
    id: 'amb-kauvery',
    name: 'Kauvery Hospital 24/7 Emergency & Cardiac Ambulance',
    shortName: 'Kauvery Hospital',
    phone: '04314000600',
    displayPhone: '0431-4000600',
    type: 'Trauma / Critical',
    available: '24/7 Critical Care',
    avgResponseTime: '10 - 14 mins',
    location: 'Tennur High Road & Cantonment',
    lat: 10.8142,
    lon: 78.6835,
    description: 'Advanced mobile intensive care unit (MICU) equipped with ventilators, defibrillators, and paramedic team.'
  },
  {
    id: 'amb-apollo',
    name: 'Apollo Speciality Hospital Emergency Ambulance',
    shortName: 'Apollo Hospital (1066)',
    phone: '1066',
    displayPhone: '1066 / 0431-4077777',
    type: 'Trauma / Critical',
    available: '24/7 Emergency',
    avgResponseTime: '10 - 15 mins',
    location: 'Salai Road, Trichy',
    lat: 10.8162,
    lon: 78.683,
    description: 'Dedicated national emergency code 1066 with GPS-tracked emergency response vehicle and emergency doctors.'
  },
  {
    id: 'amb-cethar',
    name: 'Cethar Hospital Emergency Ambulance',
    shortName: 'Cethar Hospital',
    phone: '04312760200',
    displayPhone: '0431-2760200',
    type: 'Multi-Speciality',
    available: '24/7 Available',
    avgResponseTime: '12 - 18 mins',
    location: 'Thillai Nagar, Trichy',
    lat: 10.821,
    lon: 78.6815,
    description: 'Round-the-clock emergency transport service serving Thillai Nagar, Cantonment, and surrounding districts.'
  },
  {
    id: 'amb-102',
    name: '102 Free Mother & Child Ambulance (Janani Shishu)',
    shortName: '102 Mother & Child',
    phone: '102',
    displayPhone: '102',
    type: 'Maternity / Child',
    available: '24/7 Free Service',
    avgResponseTime: '12 - 20 mins',
    location: 'Govt Health Centers Trichy',
    lat: 10.804,
    lon: 78.673,
    description: 'Free Tamil Nadu state ambulance for expectant mothers, newborn medical transfer, and infant emergencies.'
  }
];
