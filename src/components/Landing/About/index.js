import React from 'react';
import { Box, Link, Fade, Grid, Container } from '@mui/material';

import RoadmapImage from '../../../assets/Landing/roadmap_image2.png';

const AboutSection = () => {
  return (
    <Box>
      <Link id="about" href="#about" />
      <Grid className="mp-landing-about-section">
        <Fade in={true} sx={{ transitionDelay: '1000ms' }}>
          <Container>
            <Grid container align>
              <Grid item xs={12} md={5}>
                <Box className="mp-landing-about-section-logo">
                  <img className="mp-landing-about-section-logo-img" src={RoadmapImage} alt="logo" />
                </Box>
              </Grid>
              <Grid item xs={12} md={7} className="mp-landing-about-section-inner">
                <Box>
                  <Box component={'div'} className="mp-landing-about-section-title">
                    About Kanon
                  </Box>
                  <Box component={'div'} className="mp-landing-about-section-content">
                    Kanon Exchange is the native marketplace and NFT minting platform for the Synesis One ecosystem. Kanon
                    NFT is an ontology primitive, a fractional ownership unit of the Web3 Data Utility being built by Synesis
                    DAO. All Kanon NFT holders are entitled to receive claimable SNS, Synesis DAO's governance token, based
                    on how frequently the underlying keyword is accessed by AI companies to help train their conversational
                    models
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Fade>
      </Grid>
    </Box>
  );
};

export default AboutSection;

