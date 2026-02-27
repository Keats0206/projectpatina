import { cn } from "@/lib/utils";

interface Feature42Props {
  className?: string;
  title?: string;
}

const Feature42 = ({
  className,
  title = "Our Values and Principles",
}: Feature42Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-3">
          <h2 className="row-span-2 text-3xl font-semibold lg:text-5xl">
            {title}
          </h2>
          <div>
            <h3 className="mb-2 text-xl font-medium">Team Spirit</h3>
            <p className="text-muted-foreground">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit
              architecto atque consequuntur perferendis ratione dolorem vitae,
              doloribus facere.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-xl font-medium">Innovation</h3>
            <p className="text-muted-foreground">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit
              architecto atque consequuntur perferendis ratione dolorem vitae,
              doloribus facere.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-xl font-medium">Quality</h3>
            <p className="text-muted-foreground">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit
              architecto atque consequuntur perferendis ratione dolorem vitae,
              doloribus facere.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-xl font-medium">Integrity</h3>
            <p className="text-muted-foreground">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit
              architecto atque consequuntur perferendis ratione dolorem vitae,
              doloribus facere.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Feature42 };
