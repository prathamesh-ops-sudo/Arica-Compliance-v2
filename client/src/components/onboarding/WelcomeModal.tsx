import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shield, ClipboardList, BarChart3, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

const ONBOARDING_KEY = 'arica-toucan-onboarding-completed';

interface WelcomeModalProps {
  isNewUser?: boolean;
}

const steps = [
  {
    icon: Shield,
    title: 'Welcome to Arica Toucan',
    description: 'Your comprehensive ISO 27001/27002 compliance management platform. Let us guide you through the key features.',
  },
  {
    icon: ClipboardList,
    title: 'Complete Questionnaires',
    description: 'Start by filling out the User Questionnaire to assess your organization\'s current security posture against ISO standards.',
  },
  {
    icon: BarChart3,
    title: 'AI-Powered Analysis',
    description: 'Our AI analyzes your responses and identifies compliance gaps, providing actionable recommendations with severity ratings.',
  },
  {
    icon: FileText,
    title: 'Generate Reports',
    description: 'Download professional PDF compliance reports to share with stakeholders, auditors, or management.',
  },
];

export function WelcomeModal({ isNewUser = false }: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding || isNewUser) {
      setIsOpen(true);
    }
  }, [isNewUser]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-2 py-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-primary'
                  : index < currentStep
                  ? 'bg-primary/50'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={handleSkip} className="w-full sm:w-auto">
            Skip Tour
          </Button>
          <Button onClick={handleNext} className="w-full sm:w-auto gap-2">
            {isLastStep ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Get Started
              </>
            ) : (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function resetOnboarding() {
  localStorage.removeItem(ONBOARDING_KEY);
}
