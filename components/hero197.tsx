import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Hero197Props {
  className?: string;
  title?: string;
  description?: string;
  primaryCta?: string;
  secondaryCta?: string;
}

const Hero197 = ({
  className,
  title = "Accelerate your development workflow",
  description = "Our intelligent platform helps teams automate routine tasks, streamline collaboration, and deliver higher quality code faster.",
  primaryCta = "Get started for free",
  secondaryCta = "Book a demo",
}: Hero197Props) => {
  return (
    <section className={cn("relative overflow-hidden py-32", className)}>
      <div className="container">
        <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(var(--primary)_1px,transparent_1px)] [background-size:20px_20px] opacity-25"></div>

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <Badge
              variant="outline"
              className="mb-6 bg-background px-4 py-1.5 text-sm"
            >
              Launching Soon <Sparkles className="ml-1 size-3.5" />
            </Badge>

            <h1 className="bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-5xl font-bold text-transparent md:text-6xl lg:text-7xl">
              {title}
            </h1>

            <p className="mt-6 max-w-xl text-xl text-muted-foreground">
              {description}
            </p>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
              <Button className="w-full sm:w-auto">{primaryCta}</Button>
              <Button variant="outline" className="w-full sm:w-auto">
                {secondaryCta}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Hero197 };
