declare module "react-responsive-masonry" {
  import * as React from "react";

  export interface MasonryProps extends React.HTMLAttributes<HTMLDivElement> {
    columnsCount?: number;
    gutter?: string | number;
  }

  const Masonry: React.ComponentType<MasonryProps>;
  export default Masonry;
}

