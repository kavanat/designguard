import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Select,
  MenuItem,
  InputLabel,
  Autocomplete
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
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [availableSecurities, setAvailableSecurities] = useState([]);
  const [positions, setPositions] = useState([]);
  const [accountHistory, setAccountHistory] = useState([]);
  const [securityHistory, setSecurityHistory] = useState([]);
  const [activeEventIds, setActiveEventIds] = useState([]);

  useEffect(() => {
    const fetchPositionsAndEvents = async () => {
      try {
        const data = await api.getPositions();
        console.log('Fetched Positions Data:', data);
        setPositions(data);
        
        const accountsFromPositions = [...new Set(data.map(pos => pos.account))];
        const securitiesFromPositions = [...new Set(data.map(pos => pos.security))];
        
        console.log('Extracted Accounts for SELL:', accountsFromPositions);
        console.log('Extracted Securities for SELL:', securitiesFromPositions);

        setAvailableAccounts(accountsFromPositions);
        setAvailableSecurities(securitiesFromPositions);

        const allActiveEvents = data.flatMap(pos => pos.activeEvents || []);
        const uniqueActiveIds = [...new Set(allActiveEvents.map(event => event.id))];
        setActiveEventIds(uniqueActiveIds);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchPositionsAndEvents();
    const interval = setInterval(fetchPositionsAndEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e, newValue, fieldName) => {
    if (fieldName) {
      // For Autocomplete components
      setFormData(prev => ({
        ...prev,
        [fieldName]: newValue || '' // Handle null/undefined case
      }));
    } else {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const getAvailableQuantity = () => {
    if (formData.action === 'SELL' && formData.account && formData.security) {
      const position = positions.find(
        pos => pos.account === formData.account && pos.security === formData.security
      );
      return position ? position.totalQuantity : 0;
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let success = false;
    const submittedAction = formData.action;
    const submittedAccount = formData.account ? formData.account.trim() : '';
    const submittedSecurity = formData.security ? formData.security.trim() : '';

    try {
      // Validate required fields for BUY/SELL
      if (submittedAction !== 'CANCEL') {
        if (!submittedAccount) {
          throw new Error('Account is required');
        }
        if (!submittedSecurity) {
          throw new Error('Security is required');
        }
      }

      const event = {
        ...formData,
        account: submittedAction === 'CANCEL' ? null : submittedAccount,
        security: submittedAction === 'CANCEL' ? null : submittedSecurity,
        quantity: formData.quantity ? parseInt(formData.quantity, 10) : 0
      };

      console.log('[handleSubmit] Submitting event object:', JSON.stringify(event, null, 2));

      await api.submitTradeEvent(event);
      success = true;

      setNotification({
        open: true,
        message: `Trade event ${submittedAction === 'CANCEL' ? 'cancelled' : 'submitted'} successfully`,
        severity: 'success'
      });

    } catch (error) {
      success = false;
      setNotification({
        open: true,
        message: error.response?.data?.message || error.message || `Error processing event`,
        severity: 'error'
      });
    } finally {
      if (success && submittedAction === 'BUY') {
        console.log('[handleSubmit/finally] BUY successful. Checking history. Account:', submittedAccount, 'Security:', submittedSecurity);
        setAccountHistory(prev => {
          if (submittedAccount && !prev.includes(submittedAccount)) {
            return [...prev, submittedAccount];
          }
          return prev;
        });
        setSecurityHistory(prev => {
          if (submittedSecurity && !prev.includes(submittedSecurity)) {
            return [...prev, submittedSecurity];
          }
          return prev;
        });
      }

      if (success) {
        console.log('[handleSubmit/finally] Resetting form after successful', submittedAction);
        setFormData({
          id: '',
          action: submittedAction,
          account: '',
          security: '',
          quantity: ''
        });
      } else {
        console.log('[handleSubmit/finally] Not resetting form due to error.');
      }
      
      setIsSubmitting(false);
    }
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const availableQuantity = getAvailableQuantity();

  console.log('Rendering with availableAccounts:', availableAccounts);
  console.log('Rendering with availableSecurities:', availableSecurities);
  console.log('[Render] accountHistory:', accountHistory);
  console.log('[Render] securityHistory:', securityHistory);

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

      {formData.action === 'CANCEL' ? (
        <FormControl fullWidth margin="normal">
          <InputLabel id="cancel-event-id-label">Event ID to Cancel</InputLabel>
          <Select
            labelId="cancel-event-id-label"
            name="id"
            value={formData.id}
            onChange={handleChange}
            required
            disabled={isSubmitting || activeEventIds.length === 0}
            label="Event ID to Cancel"
          >
            {activeEventIds.length === 0 && (
              <MenuItem value="" disabled>
                No active events to cancel
              </MenuItem>
            )}
            {activeEventIds.map(eventId => (
              <MenuItem key={eventId} value={eventId}>{eventId}</MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <TextField
          fullWidth
          label="Event ID"
          name="id"
          value={formData.id}
          onChange={handleChange}
          margin="normal"
          required
          disabled={isSubmitting}
          helperText="Enter a unique ID for this new event."
        />
      )}

      {formData.action !== 'CANCEL' && (
        <>
          {formData.action === 'BUY' ? (
            <Autocomplete
              freeSolo
              options={accountHistory}
              value={formData.account}
              inputValue={formData.account}
              onInputChange={(event, newInputValue) => {
                setFormData(prev => ({
                  ...prev,
                  account: newInputValue || ''
                }));
              }}
              onChange={(event, newValue) => {
                setFormData(prev => ({
                  ...prev,
                  account: newValue || ''
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Account (Type or Select)"
                  margin="normal"
                  required
                  disabled={isSubmitting}
                />
              )}
            />
          ) : (
            <FormControl fullWidth margin="normal">
              <InputLabel>Account</InputLabel>
              <Select
                name="account"
                value={formData.account}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                label="Account"
              >
                {availableAccounts.map(account => (
                  <MenuItem key={account} value={account}>{account}</MenuItem>
                ))}
                {availableAccounts.length === 0 && (
                   <MenuItem value="" disabled>No accounts with positions</MenuItem>
                )}
              </Select>
            </FormControl>
          )}

          {formData.action === 'BUY' ? (
            <Autocomplete
              freeSolo
              options={securityHistory}
              value={formData.security}
              inputValue={formData.security}
              onInputChange={(event, newInputValue) => {
                setFormData(prev => ({
                  ...prev,
                  security: newInputValue || ''
                }));
              }}
              onChange={(event, newValue) => {
                setFormData(prev => ({
                  ...prev,
                  security: newValue || ''
                }));
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Security (Type or Select)"
                  margin="normal"
                  required
                  disabled={isSubmitting}
                />
              )}
            />
          ) : (
            <FormControl fullWidth margin="normal">
              <InputLabel>Security</InputLabel>
              <Select
                name="security"
                value={formData.security}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                label="Security"
              >
                 {availableSecurities.map(security => (
                  <MenuItem key={security} value={security}>{security}</MenuItem>
                ))}
                {availableSecurities.length === 0 && (
                   <MenuItem value="" disabled>No securities with positions</MenuItem>
                )}
              </Select>
            </FormControl>
          )}

          <TextField
            fullWidth
            label={`Quantity${availableQuantity !== null ? ` (Available: ${availableQuantity})` : ''}`}
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            margin="normal"
            required
            inputProps={{ 
              min: 1,
              max: formData.action === 'SELL' ? availableQuantity : undefined
            }}
            disabled={isSubmitting}
            helperText={formData.action === 'SELL' ? `Maximum available: ${availableQuantity || 0}` : ''}
          />
        </>
      )}

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
        disabled={isSubmitting || (formData.action === 'CANCEL' && activeEventIds.length === 0)}
      >
        {isSubmitting ? <CircularProgress size={24} /> : (formData.action === 'CANCEL' ? 'Cancel Selected Event' : 'Submit Trade Event')}
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