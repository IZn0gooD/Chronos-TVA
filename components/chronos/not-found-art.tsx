"use client";

import * as notFound from "ascii.rest/pieces/not-found";
import { AsciiScene } from "@/components/ascii/ascii-scene";

/** The library's 404 piece, with this terminal's words. */
export function NotFoundArt() {
  return (
    <div className="text-sage">
      <AsciiScene
        piece={notFound}
        options={{ code: "404", title: "no such record", message: "this route is not on any timeline we keep" }}
        label="404: no such record. This route is not on any timeline we keep."
        size="clamp(7px, 1.1vw, 12px)"
      />
    </div>
  );
}
