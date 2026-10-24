import type { Variant } from "@/types/content";
import { FigureAscii } from "./figure-ascii";
import { FigureField } from "./figure-field";
import { FigureDiagram, FigureGeometric, FigureTypographic, seedOf } from "./figures";

/** Draws a file's figure, whichever of the five kinds it is. Used by the card and by the dialog. */
export function VariantFigure({ variant }: { variant: Variant }) {
  const seed = seedOf(variant.id);
  switch (variant.figure) {
    case "diagram":
      return <FigureDiagram seed={seed} />;
    case "typographic":
      return <FigureTypographic id={variant.id} seed={seed} />;
    case "geometric":
      return <FigureGeometric seed={seed} />;
    case "ascii":
      return <FigureAscii art={variant.art} />;
    case "field":
      return <FigureField field={variant.field} />;
  }
}
