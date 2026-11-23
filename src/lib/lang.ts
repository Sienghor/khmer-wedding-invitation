import { createContext, useContext } from 'react';
import { wedding } from '../config/wedding';

/** Whether English translations are shown page-wide (wedding.display.english). Names, date and the map button always keep English. */
export const EN = wedding.display.english;

/** English on for one section even when it is off page-wide (wedding.display.englishSections). */
export const englishIn = (section: string): boolean => EN || (wedding.display.englishSections as readonly string[]).includes(section);

/** Lets a section switch English on for everything inside it (Bi, SectionHeader, Countdown). */
export const EnglishContext = createContext<boolean>(EN);
export const useEnglish = () => useContext(EnglishContext);
