import React from 'react';
import { Link, Box, Container } from '@mui/material';
import AccordionPanel from './AccordionPanel';
import { accordionContent } from '../../components/Common/StaticData';

const propTypes = {};

const FAQPage = () => {
  const defaultExpanded = false;

  return (
    <Box className="mp-faq">
      <Link id="about" href="#faq" />
      <Box className="mp-faq-content">
        <Container>
          <Box className="mp-faq-content-inner">
            <Box className="mp-faq-title">FAQ</Box>
            {accordionContent.map((value, index) => {
              return (
                <AccordionPanel key={index} title={value.title} context={value.context} defaultExpanded={defaultExpanded} />
              );
            })}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

FAQPage.propTypes = propTypes;

export default FAQPage;

