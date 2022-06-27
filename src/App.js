import { Fragment, Suspense, lazy } from 'react';
import React, { useEffect, useState, useMemo } from 'react';
import { ThemeProvider, CssBaseline, useTheme, createTheme } from '@mui/material';
import { Helmet } from 'react-helmet';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
// Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { darktheme, lighttheme } from './utils/theme';
import './App.scss';
import {
  getPhantomWallet,
  getSolletWallet,
  getSolflareWallet,
  getSolletExtensionWallet,
  getLedgerWallet
} from '@solana/wallet-adapter-wallets';
// import { PhantomWalletAdapter} from '@solana/wallet-adapter-wallets';
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import ColorModeContext from './components/Common/ColorModeContext';

const { REACT_APP_PUBLIC_NETWORK, REACT_APP_ENDPOINT, REACT_APP_SENTRY_DSN } = process.env;
require('@solana/wallet-adapter-react-ui/styles.css');

Sentry.init({
  dsn: REACT_APP_SENTRY_DSN,
  maxBreadcrumbs: 10,
  debug: true,
  environment: process.env.NODE_ENV,
  integrations: [new BrowserTracing()]
});

const MainComponent = lazy(() => import('./components/Main'));

function App() {
  const [mode, setMode] = useState('dark');

  const wallets = [
    getPhantomWallet(),
    getLedgerWallet(),
    getSolletWallet(),
    getSolletExtensionWallet(),
    getSolflareWallet()
  ];

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      }
    }),
    []
  );

  const theme = useMemo(() => (mode == 'light' ? lighttheme : darktheme), [mode]);

  return (
    <Sentry.ErrorBoundary fallback={<p>An error has occurred</p>}>
      <BrowserRouter>
        <Helmet>
          <html data-theme={mode} />
        </Helmet>
        <ColorModeContext.Provider value={colorMode}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Suspense fallback={<Fragment />}>
              <ConnectionProvider endpoint={REACT_APP_ENDPOINT}>
                <WalletProvider wallets={wallets} autoConnect>
                  <WalletModalProvider>
                    <Routes>
                      <Route path="*" element={<MainComponent />} />
                    </Routes>
                  </WalletModalProvider>
                </WalletProvider>
              </ConnectionProvider>
            </Suspense>
          </ThemeProvider>
        </ColorModeContext.Provider>
      </BrowserRouter>
    </Sentry.ErrorBoundary>
  );
}

export default App;

