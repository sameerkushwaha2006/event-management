import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '@/context/EventsContext';
import { formatShortDate, isEventUpcoming } from '@/utils/dateUtils';

const Events: React.FC = () => {
  const navigate = useNavigate();
  const {
    events,
    isLoading,
    filters,
    sort,
    pagination,
    fetchEvents,
    setFilters,
    setSort,
    categories,
  } = useEvents();

  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    fetchEvents(filters, sort, pagination.page);
  }, [filters, sort, pagination.page]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    // Debounce search
    const timeoutId = setTimeout(() => {
      setFilters({ ...filters, search: value || undefined });
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleCategoryChange = (categoryId: string) => {
    setFilters({ ...filters, category: categoryId === 'all' ? undefined : categoryId });
  };

  const handleSortChange = (sortValue: string) => {
    const [field, direction] = sortValue.split('-');
    setSort({ field: field as any, direction: direction as any });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    fetchEvents(filters, sort, value);
  };

  const publishedEvents = events.filter(event =>
    event.status === 'published' && isEventUpcoming(event.date.start)
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Discover Events
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Find and register for exciting events happening near you
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category || 'all'}
                label="Category"
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={`${sort.field}-${sort.direction}`}
                label="Sort By"
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <MenuItem value="date-asc">Date (Earliest First)</MenuItem>
                <MenuItem value="date-desc">Date (Latest First)</MenuItem>
                <MenuItem value="title-asc">Title (A-Z)</MenuItem>
                <MenuItem value="title-desc">Title (Z-A)</MenuItem>
                <MenuItem value="price-asc">Price (Low to High)</MenuItem>
                <MenuItem value="price-desc">Price (High to Low)</MenuItem>
                <MenuItem value="popularity-desc">Most Popular</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* Loading State */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      )}

      {/* Events Grid */}
      {!isLoading && (
        <Grid container spacing={4}>
          {publishedEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
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
                      {event.description.substring(0, 120)}...
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
      )}

      {/* No Events Found */}
      {!isLoading && publishedEvents.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No events found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or filters to find more events.
          </Typography>
        </Box>
      )}

      {/* Pagination */}
      {!isLoading && pagination.total > pagination.limit && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={Math.ceil(pagination.total / pagination.limit)}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      )}
    </Container>
  );
};

export default Events;