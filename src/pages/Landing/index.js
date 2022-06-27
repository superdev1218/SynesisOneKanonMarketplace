import React from 'react';
import { WalletModalButton } from '@solana/wallet-adapter-react-ui';
import { Button, Box, Typography } from '@mui/material';
import HomeSection from '../../components/Landing/Home';
import AboutSection from '../../components/Landing/About';
import CollectionsSection from '../../components/Landing/Collections';
import NewGame from '../../components/Landing/NewGame';
import GameSection from '../../components/Landing/Game';
import RoadmapSection from '../../components/Landing/Roadmap';
import MarketplaceSection from '../../components/Landing/Marketplace';

const Home = () => {
  /* create an account  */
  return (
    <Box className="mp-landing">
      <HomeSection />
      <AboutSection />
      <CollectionsSection />
      <NewGame />
      {/* <GameSection/> */}
      {/* <RoadmapSection/> */}
      {/* <MarketplaceSection/> */}
    </Box>
  );
};

export default Home;
