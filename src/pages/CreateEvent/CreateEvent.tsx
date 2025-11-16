import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
} from '@mui/material';

const CreateEvent: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create Event
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Event creation form will be implemented here. This is a placeholder for the create event page.
        </Typography>
      </Paper>
    </Container>
  );
};

export default CreateEvent;