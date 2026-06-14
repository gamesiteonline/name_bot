import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import NameWizardSkeuomorphic from "./pages/NameWizardSkeuomorphic";
import { IntroScreen } from "./components/IntroScreen";
import { RoamingCartoon } from "./components/RoamingCartoon";
import { useState } from "react";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={NameWizardSkeuomorphic} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Persistent watermark footer - Skeuomorphic style
function PersistentFooter() {
  return (
    <div className="border-t-4 border-amber-900 bg-gradient-to-r from-amber-100 via-yellow-50 to-amber-100 py-4 shadow-lg">
      <p className="text-center text-amber-900 text-sm font-bold font-serif" style={{ textShadow: '1px 1px 1px rgba(255,255,255,0.5)' }}>
        Fahad - Name Bot
      </p>
    </div>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  const [introComplete, setIntroComplete] = useState(false);

  return (
    <ErrorBoundary>
      {!introComplete && <IntroScreen onComplete={() => setIntroComplete(true)} />}
      {introComplete && <RoamingCartoon />}
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <div className="flex flex-col min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
            <div className="flex-1">
              <Router />
            </div>
            <PersistentFooter />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
