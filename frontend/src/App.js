import React, { useState } from 'react';
import { Tabs, Tab, Box, Paper, Container } from '@mui/material';
import PositionSummary from './components/PositionSummary';
import TradeEntry from './components/TradeEntry';

function App() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '1rem',
              }
            }}
          >
            <Tab label="Position Summary" />
            <Tab label="Create Event" />
          </Tabs>
        </Box>
        <Box sx={{ p: 3 }}>
          {activeTab === 0 && <PositionSummary />}
          {activeTab === 1 && <TradeEntry />}
        </Box>
      </Paper>
    </Container>
  );
}

export default App; 