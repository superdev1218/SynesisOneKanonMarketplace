import React from 'react';
import { IconButton, Box, Grid, Link, useMediaQuery, Container } from '@mui/material';
import KanonColorButton from '../../Common/KanonColorButton';
import { RightArrow } from '../../Common/Arrow';
import { useNavigate } from 'react-router-dom';
import { Carousel } from 'react-responsive-carousel';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

import CollectionItem1 from '../../../assets/Landing/Collections/synesis_test01b400.jpg';
import CollectionItem2 from '../../../assets/Landing/Collections/synesis_test01c400.jpg';
import CollectionItem3 from '../../../assets/Landing/Collections/synesis_test01d400.jpg';
import CollectionItem4 from '../../../assets/Landing/Collections/synesis_test02b400.jpg';
import CollectionItem5 from '../../../assets/Landing/Collections/synesis_test02c400.jpg';
import CollectionItem6 from '../../../assets/Landing/Collections/synesis_test02d400.jpg';
import CollectionItem7 from '../../../assets/Landing/Collections/synesis_test03b400.jpg';
import CollectionItem8 from '../../../assets/Landing/Collections/synesis_test03c400.jpg';
import CollectionItem9 from '../../../assets/Landing/Collections/synesis_test03d400.jpg';
import CollectionItem10 from '../../../assets/Landing/Collections/synesis_test04b400.jpg';
import CollectionItem11 from '../../../assets/Landing/Collections/synesis_test04c400.jpg';
import CollectionItem12 from '../../../assets/Landing/Collections/synesis_test04d400.jpg';
import CollectionItem13 from '../../../assets/Landing/Collections/synesis_test05b400.jpg';
import CollectionItem14 from '../../../assets/Landing/Collections/synesis_test05c400.jpg';
import CollectionItem15 from '../../../assets/Landing/Collections/synesis_test05d400.jpg';
import LazyCollectionItem1 from '../../../assets/Landing/Collections/synesis_test01b20.jpg';
import LazyCollectionItem2 from '../../../assets/Landing/Collections/synesis_test01c20.jpg';
import LazyCollectionItem3 from '../../../assets/Landing/Collections/synesis_test01d20.jpg';
import LazyCollectionItem4 from '../../../assets/Landing/Collections/synesis_test02b20.jpg';
import LazyCollectionItem5 from '../../../assets/Landing/Collections/synesis_test02c20.jpg';
import LazyCollectionItem6 from '../../../assets/Landing/Collections/synesis_test02d20.jpg';
import LazyCollectionItem7 from '../../../assets/Landing/Collections/synesis_test03b20.jpg';
import LazyCollectionItem8 from '../../../assets/Landing/Collections/synesis_test03c20.jpg';
import LazyCollectionItem9 from '../../../assets/Landing/Collections/synesis_test03d20.jpg';
import LazyCollectionItem10 from '../../../assets/Landing/Collections/synesis_test04b20.jpg';
import LazyCollectionItem11 from '../../../assets/Landing/Collections/synesis_test04c20.jpg';
import LazyCollectionItem12 from '../../../assets/Landing/Collections/synesis_test04d20.jpg';
import LazyCollectionItem13 from '../../../assets/Landing/Collections/synesis_test05b20.jpg';
import LazyCollectionItem14 from '../../../assets/Landing/Collections/synesis_test05c20.jpg';
import LazyCollectionItem15 from '../../../assets/Landing/Collections/synesis_test05d20.jpg';

import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const CollectionsSection = () => {
  const navigate = useNavigate();
  const isXs = useMediaQuery('(max-width: 1200px)');
  const isXsMin = useMediaQuery('(max-width: 900px)');
  const collectionImages = [
    CollectionItem1,
    CollectionItem2,
    CollectionItem3,
    CollectionItem4,
    CollectionItem5,
    CollectionItem6,
    CollectionItem7,
    CollectionItem8,
    CollectionItem9,
    CollectionItem10,
    CollectionItem11,
    CollectionItem12,
    CollectionItem13,
    CollectionItem14,
    CollectionItem15
  ];
  const lazycollectionImages = [
    LazyCollectionItem1,
    LazyCollectionItem2,
    LazyCollectionItem3,
    LazyCollectionItem4,
    LazyCollectionItem5,
    LazyCollectionItem6,
    LazyCollectionItem7,
    LazyCollectionItem8,
    LazyCollectionItem9,
    LazyCollectionItem10,
    LazyCollectionItem11,
    LazyCollectionItem12,
    LazyCollectionItem13,
    LazyCollectionItem14,
    LazyCollectionItem15
  ];

  const collenctionsLarge = () => {
    let rows = [];
    for (let i = 0; i < parseInt(collectionImages.length / 2); i++) {
      rows.push(
        <Grid key={i} container spacing={2}>
          <Grid item xs={6} className="mp-landing-collection-section-card">
            <Box className="mp-landing-collection-section-carousel-card">
              <div className="img-ratio-box">
                <LazyLoadImage
                  placeholderSrc={lazycollectionImages[i * 2]}
                  effect="opacity"
                  src={collectionImages[i * 2]}
                  alt="collection"
                />
              </div>
            </Box>
          </Grid>
          <Grid item xs={6} className="mp-landing-collection-section-card">
            <Box className="mp-landing-collection-section-carousel-card">
              <div className="img-ratio-box">
                <LazyLoadImage
                  effect="opacity"
                  placeholderSrc={lazycollectionImages[i * 2 + 1]}
                  src={collectionImages[i * 2 + 1]}
                  alt="collection"
                />
              </div>
            </Box>
          </Grid>
        </Grid>
      );
      if ((i + 1) * 2 + 1 == collectionImages.length) {
        rows.push(
          <Box className="mp-landing-collection-section-carousel-card" key={collectionImages.length}>
            <div className="img-ratio-box">
              <LazyLoadImage
                effect="opacity"
                placeholderSrc={lazycollectionImages[collectionImages.length - 1]}
                src={collectionImages[collectionImages.length - 1]}
                alt="collection"
              />
            </div>
          </Box>
        );
      }
    }
    return rows;
  };
  /* create an account  */
  return (
    <Box className="mp-landing-collection-section">
      <Link id="collections" href="#collections" />
      <Box className="mp-landing-collection-section-section">
        <Container>
          <Box className="mp-landing-collection-section-title">The Aquarius Collection</Box>
          <KanonColorButton onClick={() => navigate('/marketplace')}>
            Marketplace&nbsp;&nbsp;&nbsp;
            <RightArrow />
          </KanonColorButton>
          <Carousel
            className="mp-landing-collection-section-carousel"
            renderArrowPrev={(onClickHandler, hasPrev, label) => (
              <Box className="control-arrow control-prev">
                <IconButton onClick={onClickHandler} sx={{ width: 50, height: 50 }}>
                  <ArrowBackIosNewIcon />
                </IconButton>
              </Box>
            )}
            renderArrowNext={(onClickHandler, hasNext, label) => (
              <Box className="control-arrow control-next">
                <IconButton onClick={onClickHandler} sx={{ width: 50, height: 50 }}>
                  <ArrowForwardIosIcon />
                </IconButton>
              </Box>
            )}
            showArrows={true}
            emulateTouch={true}
            showStatus={false}
            autoPlay={true}
            stopOnHover={true}
            showThumbs={false}
            infiniteLoop={true}
            showIndicators={false}
            centerMode={false}
          >
            {isXsMin
              ? collectionImages.map((item, index) => (
                  <Box className="mp-landing-collection-section-carousel-card" key={index}>
                    <div className="img-ratio-box">
                      <LazyLoadImage
                        placeholderSrc={lazycollectionImages[index]}
                        effect="opacity"
                        src={item}
                        alt="collection"
                      />
                    </div>
                  </Box>
                ))
              : collenctionsLarge()}
          </Carousel>
        </Container>
      </Box>
    </Box>
  );
};

export default CollectionsSection;

