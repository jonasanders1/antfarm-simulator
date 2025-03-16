import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Simulation from "./pages/Simulation";
import Index from "./pages/index";
import { ThemeProvider } from "./hooks/ThemeProvider";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/ant-simulation" element={<Simulation />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
