/**
 * ConnectionStatus component - displays WebSocket connection status
 */

import { useState, useEffect } from 'react';
import { Box, Chip, Tooltip, Typography } from '@mui/material';
import {
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';

import { mockWebSocket, WebSocketState } from '@/services/mockWebSocket';

const getStatusConfig = (state: WebSocketState) => {
  switch (state) {
    case 'connected':
      return {
        label: 'Connected',
        color: 'success' as const,
        icon: <WifiIcon />,
        description: 'Real-time updates are active',
      };
    case 'connecting':
      return {
        label: 'Connecting',
        color: 'warning' as const,
        icon: <SyncIcon />,
        description: 'Establishing connection...',
      };
    case 'reconnecting':
      return {
        label: 'Reconnecting',
        color: 'warning' as const,
        icon: <SyncIcon />,
        description: 'Attempting to reconnect...',
      };
    case 'disconnected':
      return {
        label: 'Disconnected',
        color: 'error' as const,
        icon: <WifiOffIcon />,
        description: 'Connection lost - real-time updates paused',
      };
    default:
      return {
        label: 'Unknown',
        color: 'default' as const,
        icon: <WifiOffIcon />,
        description: 'Connection status unknown',
      };
  }
};

export const ConnectionStatus = () => {
  const [connectionState, setConnectionState] = useState<WebSocketState>(
    mockWebSocket.getState(),
  );

  useEffect(() => {
    // Update state when WebSocket state changes
    const handleStateChange = (newState: WebSocketState) => {
      setConnectionState(newState);
    };

    // Register event handler and get unsubscribe function
    const unsubscribe = mockWebSocket.onStateChange(handleStateChange);

    // Get current state
    setConnectionState(mockWebSocket.getState());

    // Cleanup - unsubscribe handler
    return unsubscribe;
  }, []);

  const statusConfig = getStatusConfig(connectionState);

  return (
    <Tooltip title={statusConfig.description} arrow>
      <Box display="flex" alignItems="center" gap={1}>
        <Chip
          icon={statusConfig.icon}
          label={statusConfig.label}
          color={statusConfig.color}
          variant="outlined"
          size="small"
          sx={{
            '& .MuiChip-icon': {
              fontSize: 16,
            },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          Live
        </Typography>
      </Box>
    </Tooltip>
  );
};
