import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import Home from "@/pages/Home";
import Comms from "@/pages/Comms";
import CalendarPage from "@/pages/CalendarPage";
import Sales from "@/pages/Sales";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/comms" component={Comms} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/sales" component={Sales} />
      <Route path="/content" component={() => <div className="p-6"><h1 className="text-3xl font-semibold">Content</h1><p className="text-muted-foreground mt-2">Content management coming soon</p></div>} />
      <Route path="/gifts" component={() => <div className="p-6"><h1 className="text-3xl font-semibold">Gifts</h1><p className="text-muted-foreground mt-2">Gift tracking coming soon</p></div>} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between p-4 border-b">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                <ThemeToggle />
              </header>
              <main className="flex-1 overflow-auto p-6">
                <Router />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
