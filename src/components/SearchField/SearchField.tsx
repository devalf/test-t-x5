import SearchIcon from '@mui/icons-material/Search';
import {
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { ChangeEvent } from 'react';

import { useSearchStore } from '@/stores/searchStore';

export const SearchField = () => {
  const { searchQuery, setSearchQuery } = useSearchStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchQuery(searchValue);
  };

  return (
    <TextField
      placeholder="Search by customer name or order ID..."
      value={searchQuery}
      onChange={handleSearchChange}
      size="small"
      fullWidth={isMobile}
      sx={{
        minWidth: isMobile ? 'auto' : 340,
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};
