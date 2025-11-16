import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
} from '@mui/material';
import { useEvents } from '@/context/EventsContext';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentEvent, fetchEvent, isLoading } = useEvents();

  React.useEffect(() => {
    if (id) {
      fetchEvent(id);
    }
  }, [id]);

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  if (!currentEvent) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Event not found
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        {currentEvent.title}
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Event details will be implemented here. This is a placeholder for the event details page.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button variant="contained">
            Register Now
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EventDetails;