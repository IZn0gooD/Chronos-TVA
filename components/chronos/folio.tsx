import { AsciiBanner } from "@/components/ascii/ascii-banner";
import { siteConfig } from "@/config/site";

interface FolioProps {
  /** Two-digit section number: "03". */
  number: string;
  /** Section title as printed in the cartouche: "Variant Registry". */
  title: string;
}

/**
 * The folio cartouche every section carries: the section number in
 * dot-matrix block letters (ascii.rest banner, a text piece in the ink of
 * the page) and the running head in mono. Generic in form; the words and
 * the "07" total come from the site's data.
 */
export function Folio({ number, title }: FolioProps) {
  return (
    <div className="flex items-start gap-4 lg:flex-row-reverse lg:text-right">
      <div className="text-sage" aria-hidden="true">
        <AsciiBanner text={number} font="tall" pixel={1} gap={1} shadow="none" effect="still" fontSize="clamp(8px, 0.75vw, 10px)" label={`Folio ${number}`} />
      </div>
      <p className="meta-label pt-1 text-fg-subtle">
        Folio {number}/{String(siteConfig.folios).padStart(2, "0")}
        <br />
        {title}
        <br />
        Desk 07 · {siteConfig.systemId}
      </p>
    </div>
  );
}
