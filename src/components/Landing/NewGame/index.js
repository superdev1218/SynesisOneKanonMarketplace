import React from 'react';
import { Container, Box, Link } from '@mui/material';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

import CollectionItem1 from '../../../assets/Landing/Game/page_1.jpg';
import CollectionItem2 from '../../../assets/Landing/Game/page_2.jpg';
import CollectionItem3 from '../../../assets/Landing/Game/page_3.jpg';
import CollectionItem4 from '../../../assets/Landing/Game/page_4.jpg';
import LazyCollectionItem1 from '../../../assets/Landing/Game/page_1_loader.jpg';
import LazyCollectionItem2 from '../../../assets/Landing/Game/page_2_loader.jpg';
import LazyCollectionItem3 from '../../../assets/Landing/Game/page_3_loader.jpg';
import LazyCollectionItem4 from '../../../assets/Landing/Game/page_4_loader.jpg';
import GameVideo from '../../../assets/Landing/Game/page_5.mp4';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import Slider from 'react-slick';

const NewGame = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 0
  };

  const collectionImages = [CollectionItem1, CollectionItem2, CollectionItem3, CollectionItem4, GameVideo];
  const LazycollectionImages = [LazyCollectionItem1, LazyCollectionItem2, LazyCollectionItem3, LazyCollectionItem4];

  return (
    <Box className="mp-landing-new-game-section">
      <Link id="collections" href="#collections" />
      <Container fixed className="mp-landing-new-game-section-section">
        <Box className="mp-landing-new-game-section-title">Games</Box>
        <Box className="mp-landing-new-game-section-subtitle">Quantum Noesis (coming soon)</Box>
        <Slider {...settings} className="mp-landing-new-game-section-carousel">
          {collectionImages.map((item, index) => (
            <Box className="mp-landing-new-game-section-card" key={index}>
              <div className="img-ratio-box">
                {index !== 4 ? (
                  <LazyLoadImage placeholderSrc={LazycollectionImages[index]} effect="opacity" src={item} alt="collection" />
                ) : (
                  <video autoPlay loop muted>
                    <source type="video/mp4" src={item} alt="collection" />
                  </video>
                )}
              </div>
            </Box>
          ))}
        </Slider>
      </Container>
    </Box>
  );
};

export default NewGame;
