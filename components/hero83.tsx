import { cn } from "@/lib/utils";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ButtonType {
  title: string;
  url: string;
  variant: "outline" | "default";
}

const BUTTONS: ButtonType[] = [
  {
    title: "Explore",
    url: "#",
    variant: "default",
  },
  {
    title: "Sign up",
    url: "#",
    variant: "outline",
  },
];

const IMAGES = [
  {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
    alt: "",
    ratio: 0.644736842,
    className: "w-[30%]",
  },
  {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-2.svg",
    alt: "",
    ratio: 0.926829268,
    className: "w-[40%]",
  },
  {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-3.svg",
    alt: "",
    ratio: 0.644736842,
    className: "w-[30%]",
  },
];

interface Hero83Props {
  className?: string;
  title?: string;
  description?: string;
}

const Hero83 = ({
  className,
  title = "Achieve More with Elite Access Pro",
  description = "Enhance your career hunt with increased visibility, first-look opportunities and monetary incentives!",
}: Hero83Props) => {
  return (
    <section className={cn("bg-background py-32", className)}>
      <div className="container">
        <div className="flex flex-col items-center justify-center gap-10 pb-8">
          <Badge variant="secondary">Announcing our new features</Badge>
          <h1 className="max-w-lg text-center text-4xl font-semibold md:max-w-2xl md:text-6xl">
            {title}
          </h1>
          <p className="max-w-lg text-center font-medium text-foreground">
            {description}
          </p>
          <div className="flex w-full max-w-lg flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
            {BUTTONS.map((btn, index) => (
              <Button
                asChild
                variant={btn.variant}
                className="w-full md:flex-1"
                key={`hero-btn-${index}`}
              >
                <a href={btn.url}>{btn.title}</a>
              </Button>
            ))}
          </div>
        </div>
        <div className="flex w-full items-end justify-center gap-4">
          {IMAGES.map((img, index) => (
            <div className={img.className} key={`hero-img-${index}`}>
              <AspectRatio ratio={img.ratio} className="rounded-md border">
                <img
                  src={img.src}
                  alt={img.alt}
                  className="block size-full object-cover object-[50%_0%]"
                />
              </AspectRatio>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export { Hero83 };
