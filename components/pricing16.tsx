"use client";

import { CheckCircle2, Zap } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Pricing16Plan {
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: string[];
  buttonText: string;
  isPopular?: boolean;
}

interface Pricing16Props {
  className?: string;
  title?: string;
  plans?: Pricing16Plan[];
}

const DEFAULT_PLANS_16: Pricing16Plan[] = [
  {
    name: "Free",
    description: "Free forever",
    monthlyPrice: "0",
    yearlyPrice: "0",
    features: ["Up to 5 projects", "Up to 5 users", "Up to 50 tasks", "Task management", "Analytics & reports"],
    buttonText: "Start for free",
  },
  {
    name: "Starter",
    description: "For small teams and startups",
    monthlyPrice: "20",
    yearlyPrice: "15",
    features: ["Unlimited projects", "Unlimited users", "Unlimited tasks", "File storage", "Customizable workflows"],
    buttonText: "Try for 14 days",
    isPopular: true,
  },
  {
    name: "Enterprise",
    description: "For large teams and enterprises",
    monthlyPrice: "40",
    yearlyPrice: "30",
    features: ["Unlimited integrations", "Webhooks", "API access", "SAML authentication", "Dedicated support"],
    buttonText: "Try for 14 days",
  },
];

const Pricing16 = ({
  className,
  title = "Simple pricing for everyone, start for free today",
  plans = DEFAULT_PLANS_16,
}: Pricing16Props) => {
  const [isMonthly, setIsMonthly] = useState(true);

  return (
    <section className={cn("bg-muted/50 py-32", className)}>
      <div className="container">
        <div className="flex flex-col items-center gap-6">
          <Badge variant="outline">Pricing</Badge>
          <h1 className="text-center text-4xl font-semibold text-balance sm:text-5xl lg:text-7xl">
            {title}
          </h1>
          <Tabs
            value={isMonthly ? "monthly" : "yearly"}
            onValueChange={(value) => setIsMonthly(value === "monthly")}
            className="w-80"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Billed Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Billed Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="mx-auto mt-4 grid w-full max-w-5xl gap-6 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.name} className="w-full rounded-lg border bg-background p-8 shadow-sm lg:max-w-96">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    {plan.isPopular && (
                      <Badge className="flex items-center gap-1">
                        <Zap className="size-3" />
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <Separator className="my-6" />
                <div className="flex items-center gap-2">
                  <div className="flex items-start font-semibold">
                    <p className="text-xl">$</p>
                    <p className="text-5xl leading-none">
                      {isMonthly ? plan.monthlyPrice : plan.yearlyPrice}
                    </p>
                  </div>
                  {!isMonthly && plan.monthlyPrice !== plan.yearlyPrice && (
                    <div className="flex flex-col text-sm">
                      <p className="font-semibold text-destructive">Save</p>
                      <p className="text-muted-foreground line-through">${plan.monthlyPrice}</p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  per user/month, billed {isMonthly ? "monthly" : "yearly"}
                </p>
                <Button variant={plan.isPopular ? "default" : "outline"} className="mt-4 mb-2 w-full">
                  {plan.buttonText}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  No credit card required
                </p>
                <Separator className="my-6" />
                <div>
                  <p className="mb-3 text-sm font-semibold">Key features: </p>
                  <ul className="flex flex-col gap-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
                        <p>{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export { Pricing16 };
