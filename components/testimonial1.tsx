"use client";

import { Globe } from "lucide-react";
import Masonry from "react-responsive-masonry";

import { cn } from "@/lib/utils";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const testimonials = [
  {
    name: "John Doe",
    role: "CEO & Founder",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
    content:
      "Lorem ipsum dolor sit, amet Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat consequatur odio, maxime corporis, ducimus dolorem possimus aspernatur blanditiis.",
  },
  {
    name: "Jane Doe",
    role: "CTO",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
    content:
      "Lorem ipsum dolor adipisicing elit. Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat consequatur odio, maxime corporis.",
  },
  {
    name: "John Smith",
    role: "COO",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
    content:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat consequatur odio, maxime corporis, ducimus dolorem possimus aspernatur blanditiis asperiores voluptatem.",
  },
  {
    name: "Jane Smith",
    role: "Tech Lead",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
    content:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat consequatur blanditiis asperiores voluptatem Ipsam ipsa cumque.",
  },
  {
    name: "Richard Doe",
    role: "Designer",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
    content:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. repellat consequatur odio, maxime corporis, ducimus dolorem possimus aspernatur blanditiis asperiores voluptatem Ipsam ipsa cumque deleniti.",
  },
  {
    name: "Gordon Doe",
    role: "Developer",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-6.webp",
    content:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat consequatur odio, maxime corporis, ducimus dolorem possimus aspernatur blanditiis asperiores voluptatem Ipsam ipsa cumque deleniti.",
  },
  {
    name: "Alex Doe",
    role: "UI & UX Designer",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-7.webp",
    content:
      "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat consequatur odio, maxime corporis, ducimus asperiores voluptatem architecto? Ipsam ipsa cumque deleniti.",
  },
  {
    name: "Tom Doe",
    role: "Cloud Engineer",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-8.webp",
    content:
      "Lorem ipsum dolor Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat consequatur odio, maxime corporis, ducimus dolorem possimus aspernatur blanditiis.",
  },
];

interface Testimonial1Props {
  className?: string;
}

const Testimonial1 = ({ className }: Testimonial1Props) => {
  return (
    <section className={cn("mb-32 border-b pt-32", className)}>
      <div className="container">
        <div className="flex flex-col items-center gap-6">
          <Badge variant="outline">Testimonials</Badge>
          <h2 className="mb-2 text-center text-3xl font-semibold lg:text-5xl">
            Meet our happy clients
          </h2>
          <p className="text-muted-foreground lg:text-lg">
            All of our 1000+ clients are happy
          </p>
          <div className="flex w-full flex-col justify-center gap-4 sm:flex-row">
            <Button className="w-full sm:w-auto">
              <Globe className="mr-2 size-4" />
              Primary Button
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <Globe className="mr-2 size-4" />
              Secondary Button
            </Button>
          </div>
          <div className="mt-6 block lg:mt-14 lg:hidden">
            <Carousel opts={{}} className="w-full max-w-[264px] sm:max-w-md">
              <CarouselContent>
                {testimonials.map((testimonial, idx) => (
                  <CarouselItem key={idx} className="flex items-center">
                    <Card>
                      <CardContent className="px-6 pt-6 leading-7 text-foreground/70">
                        <q>{testimonial.content}</q>
                      </CardContent>
                      <CardFooter>
                        <div className="flex gap-4 leading-5">
                          <Avatar className="size-9 rounded-full ring-1 ring-input">
                            <AvatarImage
                              src={testimonial.avatar}
                              alt={testimonial.name}
                            />
                          </Avatar>
                          <div className="text-sm">
                            <p className="font-medium">{testimonial.name}</p>
                            <p className="text-muted-foreground">
                              {testimonial.role}
                            </p>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
          <div className="mt-14 hidden h-[522px] w-full overflow-hidden lg:block">
            <Masonry gutter="20px" columnsCount={4}>
              {testimonials.map((testimonial, idx) => {
                return (
                  <Card
                    key={idx}
                    className={cn(
                      "max-w-md",
                      idx === 1 && "mt-10",
                      idx === 2 && "mt-20",
                    )}
                  >
                    <CardContent className="px-6 pt-6 leading-7 text-foreground/70">
                      <q>{testimonial.content}</q>
                    </CardContent>
                    <CardFooter>
                      <div className="flex gap-4 leading-5">
                        <Avatar className="size-9 rounded-full ring-1 ring-input">
                          <AvatarImage
                            src={testimonial.avatar}
                            alt={testimonial.name}
                          />
                        </Avatar>
                        <div className="text-sm">
                          <p className="font-medium">{testimonial.name}</p>
                          <p className="text-muted-foreground">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </Masonry>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Testimonial1 };
