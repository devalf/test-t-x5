import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { theme } from './theme/theme';
import { OrdersPage } from './pages/OrdersPage/OrdersPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <OrdersPage />
          </Box>
        </Container>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
