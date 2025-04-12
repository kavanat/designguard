import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Button,
  Collapse,
  Typography
} from '@mui/material';
import api from '../services/api';

function Row({ position }) {
  const [open, setOpen] = useState(false);

  // Log the received position object
  console.log('Row component received position:', position);

  return (
    <>
      <TableRow>
        <TableCell>
          <Button
            size="small"
            onClick={() => setOpen(!open)}
            variant="text"
          >
            {open ? '▼' : '▶'}
          </Button>
        </TableCell>
        <TableCell>{position.account}</TableCell>
        <TableCell>{position.security}</TableCell>
        <TableCell align="right">{position.totalQuantity}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Active Events
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Event ID</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {position.activeEvents && position.activeEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell component="th" scope="row">
                        {event.id}
                      </TableCell>
                      <TableCell>{event.action}</TableCell>
                      <TableCell align="right">{event.quantity}</TableCell>
                    </TableRow>
                  ))}
                  {(!position.activeEvents || position.activeEvents.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No active events
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function PositionSummary() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPositions = async () => {
    try {
      const data = await api.getPositions();
      setPositions(data);
    } catch (error) {
      console.error('Error fetching positions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Account</TableCell>
            <TableCell>Security</TableCell>
            <TableCell align="right">Quantity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {positions.map((position, index) => (
            <Row key={`${position.account}-${position.security}-${index}`} position={position} />
          ))}
          {positions.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No positions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default PositionSummary; 