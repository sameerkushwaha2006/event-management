import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
} from '@mui/material';

const Admin: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="body1">
          Admin dashboard will be implemented here. This is a placeholder for the admin page.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Admin;