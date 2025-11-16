import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Grid,
  Chip,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Event as EventIcon,
  LocationOn,
  Schedule,
  Person,
  Group,
  AttachMoney,
  Share,
  FavoriteBorder,
  ArrowBack,
} from '@mui/icons-material';
import { useEvents } from '@/context/EventsContext';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime, formatShortDate, formatTime, isEventUpcoming } from '@/utils/dateUtils';
import { RegistrationData } from '@/types';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentEvent, fetchEvent, isLoading } = useEvents();
  const { isAuthenticated, user } = useAuth();

  const [registrationOpen, setRegistrationOpen] = React.useState(false);
  const [selectedTicket, setSelectedTicket] = React.useState('');
  const [quantity, setQuantity] = React.useState(1);
  const [registrationData, setRegistrationData] = React.useState<RegistrationData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    dietary: '',
    accessibility: '',
  });

  React.useEffect(() => {
    if (id) {
      fetchEvent(id);
    }
  }, [id]);

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    setRegistrationOpen(true);
  };

  const handleRegistrationSubmit = () => {
    // TODO: Implement registration logic
    setRegistrationOpen(false);
  };

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
          <Button variant="outlined" onClick={() => navigate('/events')} sx={{ mt: 2 }}>
            Back to Events
          </Button>
        </Box>
      </Container>
    );
  }

  const isUpcoming = isEventUpcoming(currentEvent.date.start);
  const cheapestTicket = currentEvent.tickets.reduce((min, ticket) =>
    ticket.price < min.price ? ticket : min
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/events')}
        sx={{ mb: 3 }}
      >
        Back to Events
      </Button>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Event Header */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Chip
                label={currentEvent.category.name}
                sx={{
                  backgroundColor: currentEvent.category.color,
                  color: 'white',
                  mb: 2,
                }}
              />
              <Typography variant="h4" gutterBottom>
                {currentEvent.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {currentEvent.description}
              </Typography>
            </Box>

            {/* Event Image */}
            <Box
              sx={{
                height: 300,
                backgroundColor: 'primary.light',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                mb: 3,
              }}
            >
              Event Banner Image
            </Box>

            {/* Event Details */}
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Schedule color="action" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Date & Time
                    </Typography>
                    <Typography variant="body1">
                      {formatDateTime(currentEvent.date.start)}
                    </Typography>
                    {currentEvent.date.end && (
                      <Typography variant="body2" color="text.secondary">
                        to {formatDateTime(currentEvent.date.end)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn color="action" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1">
                      {currentEvent.location.type === 'virtual'
                        ? 'Virtual Event'
                        : currentEvent.location.venue || 'TBD'}
                    </Typography>
                    {currentEvent.location.address && (
                      <Typography variant="body2" color="text.secondary">
                        {currentEvent.location.address}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Group color="action" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Attendees
                    </Typography>
                    <Typography variant="body1">
                      {currentEvent.currentAttendees} attending
                    </Typography>
                    {currentEvent.maxAttendees && (
                      <Typography variant="body2" color="text.secondary">
                        {currentEvent.maxAttendees - currentEvent.currentAttendees} spots left
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoney color="action" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Price Range
                    </Typography>
                    <Typography variant="body1">
                      From ${cheapestTicket.price}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* Organizer Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                {currentEvent.organizer.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Organized by
                </Typography>
                <Typography variant="body1">
                  {currentEvent.organizer.name}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleRegisterClick}
                disabled={!isUpcoming}
                sx={{ flexGrow: 1, maxWidth: 200 }}
              >
                {isUpcoming ? 'Register Now' : 'Event Ended'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<FavoriteBorder />}
                size="large"
              >
                Save
              </Button>
              <Button
                variant="outlined"
                startIcon={<Share />}
                size="large"
              >
                Share
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ticket Options
            </Typography>

            {currentEvent.tickets.map((ticket) => (
              <Box
                key={ticket.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'grey.300',
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  {ticket.name}
                </Typography>
                {ticket.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {ticket.description}
                  </Typography>
                )}
                <Typography variant="h6" color="primary" gutterBottom>
                  ${ticket.price}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ticket.available} available
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary">
              <strong>Refund Policy:</strong> {currentEvent.settings.refundPolicy || 'No refunds'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Registration Dialog */}
      <Dialog open={registrationOpen} onClose={() => setRegistrationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register for {currentEvent.title}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Ticket Type</InputLabel>
            <Select
              value={selectedTicket}
              label="Ticket Type"
              onChange={(e) => setSelectedTicket(e.target.value)}
            >
              {currentEvent.tickets.map((ticket) => (
                <MenuItem key={ticket.id} value={ticket.id}>
                  {ticket.name} - ${ticket.price}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="First Name"
            value={registrationData.firstName}
            onChange={(e) => setRegistrationData({ ...registrationData, firstName: e.target.value })}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            label="Last Name"
            value={registrationData.lastName}
            onChange={(e) => setRegistrationData({ ...registrationData, lastName: e.target.value })}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={registrationData.email}
            onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            label="Phone"
            value={registrationData.phone}
            onChange={(e) => setRegistrationData({ ...registrationData, phone: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistrationOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleRegistrationSubmit}>
            Complete Registration
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EventDetails;