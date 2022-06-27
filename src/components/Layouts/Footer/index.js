import React, { useState } from 'react';
import { Box, useMediaQuery, Dialog, IconButton } from '@mui/material';
import { HashLink as Link } from 'react-router-hash-link';
import Logo from '../../../assets/logo.png';
import DISCORD_IMAGE from '../../../assets/Landing2/discord.png';
import MEDIUM_IMAGE from '../../../assets/Landing2/medium.png';
import TELEGRAM_IMAGE from '../../../assets/Landing2/telegram.png';
import TWITTER_IMAGE from '../../../assets/Landing2/twitter.png';

import CloseIcon from '@mui/icons-material/Close';
import HtmlFile from './HtmlFile';

const Footer = () => {
  const isXsMin = useMediaQuery('(min-width:601px)');

  const [open, setOpen] = useState(false);
  const menuImages1 = [DISCORD_IMAGE, MEDIUM_IMAGE, TELEGRAM_IMAGE, TWITTER_IMAGE];
  const menuLinks = [
    'https://discord.gg/synesisone',
    'https://medium.com/synesis-one',
    'https://t.me/Synesis_One',
    'https://twitter.com/synesis_one'
  ];

  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  /* create an account  */
  return (
    <Box className="pm-footer">
      {isXsMin && (
        <Box className="pm-footer-desktop">
          <Link to="/">
            <Box className="pm-footer-logo-wrp">
              <img src={Logo} alt="logo" className="pm-footer-logo" />
            </Box>
          </Link>
          <Box className="pm-footer-menu">
            <Box className="pm-footer-menu-social">
              {menuImages1.map((item, i) => (
                <a href={menuLinks[i]} target="_blank" rel="noreferrer" key={i} className="pm-footer-mobile-menu-item">
                  <img src={item} alt="menu" className="pm-footer-menu-social-item" />
                </a>
              ))}
            </Box>
          </Box>
          <a onClick={handleOpen} className="pm-footer-terms">
            Terms
          </a>
        </Box>
      )}
      {!isXsMin && (
        <Box className="pm-footer-mobile">
          <Box className="pm-footer-mobile-logo-wrp">
            <Link to="/">
              <Box className="pm-footer-logo-wrp">
                <img src={Logo} alt="logo" className="pm-footer-logo" />
              </Box>
            </Link>
            <a onClick={handleOpen} className="pm-footer-terms">
              Terms
            </a>
          </Box>
          <Box className="pm-footer-mobile-menu">
            {menuImages1.map((item, i) => (
              <a href={menuLinks[i]} target="_blank" rel="noreferrer" key={i} className="pm-footer-mobile-menu-item">
                <img src={item} alt="menu" className="pm-footer-menu-social-item" />
              </a>
            ))}
          </Box>
        </Box>
      )}
      <Dialog
        className="pm-footer-detail-modal"
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <Box sx={{ position: 'absolute', right: 10, top: 10, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box className="pm-footer-terms-text">
          <HtmlFile />
        </Box>
      </Dialog>
    </Box>
  );
};

export default Footer;
