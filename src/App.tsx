import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Leaders from "./pages/Leaders";
import Appointments from "./pages/Appointments";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/members" element={
            <Layout>
              <Members />
            </Layout>
          } />
          <Route path="/leaders" element={
            <Layout>
              <Leaders />
            </Layout>
          } />
          <Route path="/appointments" element={
            <Layout>
              <Appointments />
            </Layout>
          } />
          <Route path="/events" element={
            <Layout>
              <Events />
            </Layout>
          } />
          <Route path="/events/new" element={
            <Layout>
              <CreateEvent />
            </Layout>
          } />
          <Route path="/events/:id/edit" element={
            <Layout>
              <EditEvent />
            </Layout>
          } />
          <Route path="/events/:id" element={<EventDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
