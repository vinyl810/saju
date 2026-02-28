'use client';

import { createContext, useContext } from 'react';

const PdfModeContext = createContext(false);

export const PdfModeProvider = PdfModeContext.Provider;
export const usePdfMode = () => useContext(PdfModeContext);
