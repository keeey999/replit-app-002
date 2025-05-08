import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layouts/app-layout";
import Home from "@/pages/home";
import MbtiTypes from "@/pages/mbti-types";
import Test from "@/pages/test";
import TeamBuilder from "@/pages/team-builder";
import TeamAnalysis from "@/pages/team-analysis";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/mbti-types" component={MbtiTypes} />
      <Route path="/test" component={Test} />
      <Route path="/team-builder" component={TeamBuilder} />
      <Route path="/team-analysis" component={TeamAnalysis} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppLayout>
          <Router />
        </AppLayout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
