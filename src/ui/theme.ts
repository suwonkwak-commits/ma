import { Platform } from 'react-native';

export const colors = {
  background: '#071411',
  card: '#0d211c',
  cardRaised: '#122b23',
  border: '#244037',
  gold: '#d4b77b',
  goldFaint: '#827451',
  text: '#ede8da',
  muted: '#8ba69b',
  dim: '#577568',
  jade: '#82baa2',
  red: '#c77c6b',
};

export const serif = Platform.select({ web: 'Georgia, "Times New Roman", serif', ios: 'Georgia', default: 'serif' });
