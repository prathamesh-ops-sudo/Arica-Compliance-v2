import { useState } from "react";
import { ClipboardList, Send, CheckCircle2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { userQuestions, type Question } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function UserQuestionnaire() {
  const { toast } = useToast();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(responses).length;
  const progress = (answeredCount / userQuestions.length) * 100;

  const submitMutation = useMutation({
    mutationFn: async (data: { responses: Record<string, string> }) => {
      return apiRequest("POST", "/api/questionnaire/user", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Questionnaire Submitted",
        description: "Thank you! Your responses have been recorded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your responses. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (answeredCount < userQuestions.length) {
      toast({
        title: "Incomplete Questionnaire",
        description: `Please answer all ${userQuestions.length} questions before submitting.`,
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate({ responses });
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Thank You!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your questionnaire has been submitted successfully. Our team will review your responses
            and generate a comprehensive compliance report.
          </p>
          <Button onClick={() => { setSubmitted(false); setResponses({}); }} data-testid="button-new-questionnaire">
            Start New Questionnaire
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <ClipboardList className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="text-user-questionnaire-title">
            Organization Employee Questionnaire
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Answer the following questions to assess your organization&apos;s ISO 27001/27002 compliance status.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-sm font-medium text-muted-foreground">Progress</span>
              <span className="text-sm font-medium text-foreground">
                {answeredCount} of {userQuestions.length} questions answered
              </span>
            </div>
            <Progress value={progress} className="h-2" data-testid="progress-questionnaire" />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {userQuestions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              value={responses[question.id]}
              onChange={(value) => setResponses((prev) => ({ ...prev, [question.id]: value }))}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-card rounded-lg border">
          <div className="text-center sm:text-left">
            <p className="font-medium text-foreground">Ready to submit?</p>
            <p className="text-sm text-muted-foreground">
              {answeredCount === userQuestions.length
                ? "All questions answered. You can now submit."
                : `${userQuestions.length - answeredCount} questions remaining.`}
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending || answeredCount < userQuestions.length}
            className="gap-2 min-w-[140px]"
            data-testid="button-submit-questionnaire"
          >
            {submitMutation.isPending ? "Submitting..." : "Submit"}
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  value,
  onChange,
}: {
  question: Question;
  index: number;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Card className={value ? "border-primary/30 bg-primary/5" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
              {index + 1}
            </span>
            <div>
              <CardTitle className="text-base font-medium leading-relaxed">
                {question.text}
              </CardTitle>
              <CardDescription className="mt-1 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                {question.isoReference}
              </CardDescription>
            </div>
          </div>
          {value && (
            <Badge variant="secondary" className="shrink-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Answered
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={value}
          onValueChange={onChange}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2"
        >
          {question.options.map((option) => (
            <div key={option} className="flex items-center">
              <RadioGroupItem
                value={option}
                id={`${question.id}-${option}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`${question.id}-${option}`}
                className="flex-1 cursor-pointer rounded-md border border-border bg-card px-3 py-2.5 text-center text-sm font-medium transition-colors peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary hover:bg-muted"
                data-testid={`option-${question.id}-${option.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {option}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
