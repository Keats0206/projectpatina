"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import { useRef } from "react";

import { cn } from "@/lib/utils";

import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const testimonials1 = [
  {
    name: "John Doe",
    role: "CEO & Founder",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
    content:
      "Lorem ipsum dolor sit, amet Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat.",
  },
  {
    name: "Jane Doe",
    role: "CTO",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
    content:
      "Lorem ipsum dolor sit, amet Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat.",
  },
  {
    name: "John Smith",
    role: "COO",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
    content:
      "Lorem ipsum dolor sit, amet Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat.",
  },
  {
    name: "Jane Smith",
    role: "Tech Lead",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
    content:
      "Lorem ipsum dolor sit, amet Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat.",
  },
  {
    name: "Richard Doe",
    role: "Designer",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
    content:
      "Lorem ipsum dolor sit, amet Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat.",
  },
  {
    name: "Gordon Doe",
    role: "Developer",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-6.webp",
    content:
      "Lorem ipsum dolor sit, amet Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat.",
  },
];
const testimonials2 = [
  {
    name: "John Doe",
    role: "CEO & Founder",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
    content:
      "Lorem ipsum dolor sit, amet Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat.",
  },
  {
    name: "Jane Doe",
    role: "CTO",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
    content:
      "Lorem ipsum dolor sit, amet Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat.",
  },
  {
    name: "John Smith",
    role: "COO",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
    content:
      "Lorem ipsum dolor sit, amet Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat.",
  },
  {
    name: "Jane Smith",
    role: "Tech Lead",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
    content:
      "Lorem ipsum dolor sit, amet Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat.",
  },
  {
    name: "Richard Doe",
    role: "Designer",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
    content:
      "Lorem ipsum dolor sit, amet Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat.",
  },
  {
    name: "Gordon Doe",
    role: "Developer",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-6.webp",
    content:
      "Lorem ipsum dolor sit, amet Odio, incidunt. Ratione, ullam? Iusto id ut omnis repellat.",
  },
];

interface Testimonial7Props {
  className?: string;
}

const Testimonial7 = ({ className }: Testimonial7Props) => {
  const plugin1 = useRef(
    AutoScroll({
      startDelay: 500,
      speed: 0.7,
    }),
  );

  const plugin2 = useRef(
    AutoScroll({
      startDelay: 500,
      speed: 0.7,
      direction: "backward",
    }),
  );
  return (
    <section className={cn("py-32", className)}>
      <div className="container flex flex-col items-center gap-6">
        <h2 className="mb-2 text-center text-3xl font-semibold lg:text-5xl">
          Meet our happy clients
        </h2>
        <p className="text-muted-foreground lg:text-lg">
          All of our 1000+ clients are happy
        </p>
        <Button className="mt-6">Get started for free</Button>
      </div>
      <div className="lg:container">
        <div className="mt-16 space-y-4">
          <Carousel
            opts={{
              loop: true,
            }}
            plugins={[plugin1.current]}
            onMouseLeave={() => plugin1.current.play()}
          >
            <CarouselContent>
              {testimonials1.map((testimonial, index) => (
                <CarouselItem key={index} className="basis-auto">
                  <Card className="max-w-96 p-6 select-none">
                    <div className="mb-4 flex gap-4">
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
                    <q>{testimonial.content}</q>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <Carousel
            opts={{
              loop: true,
            }}
            plugins={[plugin2.current]}
            onMouseLeave={() => plugin2.current.play()}
          >
            <CarouselContent>
              {testimonials2.map((testimonial, index) => (
                <CarouselItem key={index} className="basis-auto">
                  <Card className="max-w-96 p-6 select-none">
                    <div className="mb-4 flex gap-4">
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
                    <q>{testimonial.content}</q>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export { Testimonial7 };
