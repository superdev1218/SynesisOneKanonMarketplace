import React from 'react';

import { useState } from 'react';

import { Accordion, AccordionSummary, AccordionDetails, Box, Typography, List, ListItem } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const AccordionPanel = (props) => {
  const { title, context, defaultExpanded } = props;

  const [expanded, setExpaned] = useState(defaultExpanded);

  const onChangeExpanded = () => {
    setExpaned(!expanded);
  };

  return (
    <Accordion className="accordion-root" defaultExpanded={defaultExpanded}>
      <AccordionSummary
        expandIcon={expanded === false ? <AddIcon className="accordion-icon" /> : <RemoveIcon className="accordion-icon" />}
        aria-controls={`panel1a-content-${title}`}
        id={`panel1a-header-${title}`}
        onClick={() => onChangeExpanded()}
      >
        <Typography sx={{ fontSize: 18 }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <List>
          <Typography sx={{ fontSize: 14, color: 'rgba(224, 224, 255, 0.8)' }} component="span">
            {' '}
            {context}{' '}
          </Typography>
        </List>
      </AccordionDetails>
    </Accordion>
  );
};
export default AccordionPanel;

