import { cn } from '@/lib/utils';
import { Check, User, Building2, UserCheck } from 'lucide-react';

interface RegistrationStepsProps {
  currentStep: number;
  completedSteps: number[];
}

const steps = [
  {
    id: 1,
    name: 'Data Akun',
    description: 'Email, password, dan tujuan',
    icon: User
  },
  {
    id: 2,
    name: 'Data Penyelenggara',
    description: 'Informasi perusahaan',
    icon: Building2
  },
  {
    id: 3,
    name: 'Data Penanggung Jawab',
    description: 'Informasi PIC',
    icon: UserCheck
  }
];

export function RegistrationSteps({ currentStep, completedSteps }: RegistrationStepsProps) {
  return (
    <div className="w-full py-6">
      <nav aria-label="Progress">
        <ol className="flex items-center justify-center space-x-8">
          {steps.map((step, stepIdx) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const Icon = step.icon;

            return (
              <li key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted-foreground/30 bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                
                <div className="ml-4 min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium transition-colors",
                      isCompleted || isCurrent
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {stepIdx < steps.length - 1 && (
                  <div
                    className={cn(
                      "ml-6 w-16 h-0.5 transition-colors",
                      isCompleted
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}