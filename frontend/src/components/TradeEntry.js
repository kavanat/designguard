import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import api from '../services/api';

function TradeEntry() {
  const [formData, setFormData] = useState({
    id: '',
    action: 'BUY',
    account: '',
    security: '',
    quantity: ''
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const event = {
        ...formData,
        quantity: parseInt(formData.quantity, 10)
      };
      await api.submitTradeEvent(event);
      setNotification({
        open: true,
        message: 'Trade event submitted successfully',
        severity: 'success'
      });
      if (formData.action !== 'CANCEL') {
        setFormData({
          id: '',
          action: 'BUY',
          account: '',
          security: '',
          quantity: ''
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: error.message || 'Error submitting trade event',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto' }}>
      <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
        <FormLabel component="legend">Action</FormLabel>
        <RadioGroup
          row
          name="action"
          value={formData.action}
          onChange={handleChange}
          sx={{ justifyContent: 'space-between' }}
        >
          <FormControlLabel value="BUY" control={<Radio />} label="Buy" />
          <FormControlLabel value="SELL" control={<Radio />} label="Sell" />
          <FormControlLabel value="CANCEL" control={<Radio />} label="Cancel" />
        </RadioGroup>
      </FormControl>

      <TextField
        fullWidth
        label="Event ID"
        name="id"
        value={formData.id}
        onChange={handleChange}
        margin="normal"
        required
        disabled={isSubmitting}
      />

      {formData.action !== 'CANCEL' && (
        <>
          <TextField
            fullWidth
            label="Account"
            name="account"
            value={formData.account}
            onChange={handleChange}
            margin="normal"
            required
            disabled={isSubmitting}
          />

          <TextField
            fullWidth
            label="Security"
            name="security"
            value={formData.security}
            onChange={handleChange}
            margin="normal"
            required
            disabled={isSubmitting}
          />

          <TextField
            fullWidth
            label="Quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            margin="normal"
            required
            inputProps={{ min: 1 }}
            disabled={isSubmitting}
          />
        </>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        disabled={isSubmitting}
      >
        {isSubmitting ? <CircularProgress size={24} /> : 'Submit Trade Event'}
      </Button>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default TradeEntry; 