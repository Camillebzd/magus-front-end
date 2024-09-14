import { createContext } from 'react';
import { Weapon } from '@/scripts/entities';

export const UserWeaponsContext = createContext<Weapon[]>([]);