import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/context/EventsContext';
import { formatShortDate, isEventUpcoming } from '@/utils/dateUtils';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { events, isLoading, fetchEvents } = useEvents();

  React.useEffect(() => {
    fetchEvents({}, { field: 'date', direction: 'asc' }, 1, 6);
  }, []);

  const featuredEvents = events.filter(event =>
    event.status === 'published' && isEventUpcoming(event.date.start)
  ).slice(0, 3);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', py: 8, mb: 6 }}>
        <Typography component="h1" variant="h2" gutterBottom>
          Welcome to Event Management
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Create, manage, and attend amazing events in your community
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/events')}
          >
            Browse Events
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/create-event')}
          >
            Create Event
          </Button>
        </Box>
      </Box>

      {/* Featured Events */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Featured Events
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Discover upcoming events in your area
        </Typography>

        <Grid container spacing={4}>
          {featuredEvents.map((event) => (
            <Grid item xs={12} md={4} key={event.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    backgroundColor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                  }}
                >
                  Event Image
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={event.category.name}
                      size="small"
                      sx={{
                        backgroundColor: event.category.color,
                        color: 'white',
                        mb: 1,
                      }}
                    />
                    <Typography variant="h6" component="h2" gutterBottom>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {event.description.substring(0, 100)}...
                    </Typography>
                  </Box>

                  <Box sx={{ mt: 'auto' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📅 {formatShortDate(event.date.start)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      📍 {event.location.type === 'virtual' ? 'Virtual Event' : event.location.city}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      👥 {event.currentAttendees} attending
                    </Typography>
                    <Typography variant="h6" color="primary">
                      From ${Math.min(...event.tickets.map(t => t.price))}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/events')}
          >
            View All Events
          </Button>
        </Box>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, backgroundColor: 'grey.50', borderRadius: 2, px: 4 }}>
        <Grid container spacing={4} textAlign="center">
          <Grid item xs={6} md={3}>
            <Typography variant="h4" color="primary" gutterBottom>
              100+
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Active Events
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="h4" color="primary" gutterBottom>
              50+
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Event Organizers
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="h4" color="primary" gutterBottom>
              1000+
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Happy Attendees
            </Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="h4" color="primary" gutterBottom>
              8
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Event Categories
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;