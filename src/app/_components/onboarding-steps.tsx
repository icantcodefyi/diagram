import { useState, useEffect } from "react";
import { Button } from "@/components/ui/texturebutton";
import { PlayIcon } from "lucide-react";
import { IntroDisclosure } from "@/components/ui/intro-disclosure";

export const ONBOARDING_STORAGE_KEY = "diagram-generator-onboarding-completed";

export const onboardingSteps = [
  {
    title: "Welcome to AutoDiagram",
    short_description: "AI-Powered Diagram Generator",
    full_description:
      "Transform your ideas into professional diagrams instantly with our AI-powered tool. No design skills needed!",
    media: {
      type: "video" as const,
      src: "/video.mp4",
      alt: "AutoDiagram introduction",
      autoplay: true
    },
  },
  {
    title: "Describe Your Vision",
    short_description: "Text to Visual Magic",
    full_description:
      "Simply type what you want to visualize - flowcharts, architecture diagrams, or any technical concept. Our AI understands and creates the perfect diagram.",
    media: {
      type: "video" as const,
      src: "/videos/feature-2.mp4",
      alt: "Diagram generation example",
      autoplay: true
    },
  },
  {
    title: "Professional Export",
    short_description: "Share Your Work",
    full_description:
      "Export your diagrams in multiple formats (SVG, PNG, PDF) and easily share them with your team. Your work is automatically saved for future access.",
    media: {
      type: "video" as const,
      src: "/videos/feature-3.mp4",
      alt: "Export options demonstration",
      autoplay: true
    },
  },
  {
    title: "Start Creating",
    short_description: "Ready to Transform Ideas",
    full_description:
      "You're all set! Type your diagram description and watch as AI brings your vision to life in seconds.",
  },
];

export function OnboardingComponent() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(true); // Default to true to prevent flash

  useEffect(() => {
    // Check if user has completed onboarding
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
    setHasCompletedOnboarding(completed);
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };

  return (
    <>
      {!hasCompletedOnboarding && (
        <Button
          variant="starter"
          className="gap-2"
          onClick={() => setShowOnboarding(true)}
        >
          <PlayIcon className="h-4 w-4" />
          Start Tutorial
        </Button>
      )}
      <IntroDisclosure
        open={showOnboarding}
        setOpen={setShowOnboarding}
        steps={onboardingSteps}
        featureId="diagram-generator-intro"
        showProgressBar={true}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    </>
  );
} 