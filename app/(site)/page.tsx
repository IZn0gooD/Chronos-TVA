import { BootSequence } from "@/components/chronos/boot-sequence";
import { Directives } from "@/components/chronos/directives/directives";
import { Folio } from "@/components/chronos/folio";
import { Hero } from "@/components/chronos/hero/hero";
import { NexusReportForm, TimelineExplorer, VariantRegistry } from "@/components/chronos/islands";
import { TemporalAnomaly } from "@/components/chronos/temporal-anomaly/temporal-anomaly";
import { AnimatedText } from "@/components/motion/animated-text";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { Divider } from "@/components/ui/divider";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/ui/section-header";
import { siteConfig } from "@/config/site";
import { BRANCH_STATE_LABELS, branches } from "@/data/branches";
import { directives } from "@/data/directives";
import { CATEGORY_LABELS, STATUS_LABELS, variants } from "@/data/variants";

const { features } = siteConfig;

/**
 * The folder, cover to colophon. Each section is a landmark with the id its
 * navigation link points to; data comes from data/, presentation from
 * components/chronos. Everything renders on the server; only the
 * interactive islands ship JavaScript, and the WebGL scenes ship only on
 * the client, over plates that are already in the HTML.
 */
export default function Page() {
  return (
    <>
      {features.bootSequence && <BootSequence />}

      <Hero />

      {features.temporalAnomaly && (
        <Section id="temporal-anomaly" surface="green" spacing="flush" aria-labelledby="anomaly-title">
          <TemporalAnomaly />
        </Section>
      )}

      {features.variantRegistry && (
        <Section id="variant-registry" aria-labelledby="registry-title">
          <Container>
            <Reveal effect="rise">
              <SectionHeader
                index="04"
                eyebrow="Variant Registry // Archive"
                title={
                  <AnimatedText as="span" id="registry-title" className="block">
                    Files under observation.
                  </AnimatedText>
                }
                lede="Eight cases, five kinds of record: diagrams, numerals, ASCII pieces, geometric plates and live shader fields. Filter by category or status; open a file to read the desk's notes. Every case is fictional and written for this terminal."
                aside={<Folio number="04" title="Variant Registry" />}
              />
            </Reveal>
            <div className="mt-12 lg:mt-16">
              <VariantRegistry variants={variants} statusLabels={STATUS_LABELS} categoryLabels={CATEGORY_LABELS} />
            </div>
          </Container>
        </Section>
      )}

      {features.timelineExplorer && (
        <Section id="timeline-explorer" surface="green" aria-labelledby="explorer-title">
          <Container>
            <Reveal effect="rise">
              <SectionHeader
                index="05"
                eyebrow="Timeline Explorer // Plate V, branch survey"
                title={
                  <AnimatedText as="span" id="explorer-title" className="block">
                    Select a branch. Read its file.
                  </AnimatedText>
                }
                lede="The sacred timeline and the five branches currently on record. Markers are selectable; the branch list works with the arrow keys. The branch you select lights its orbital in the chamber above. Divergence figures are illustrative, not measurements."
                aside={<Folio number="05" title="Timeline Explorer" />}
              />
            </Reveal>
            <div className="mt-12 lg:mt-16">
              <TimelineExplorer
                branches={branches}
                stateLabels={BRANCH_STATE_LABELS}
                notice="Fictional data. Branch identifiers, dates and divergence figures are invented for this interface."
              />
            </div>
          </Container>
        </Section>
      )}

      {features.directives && (
        <Section id="directives" aria-labelledby="directives-title">
          <Container>
            <Reveal effect="rise">
              <SectionHeader
                index="06"
                eyebrow="Directives // Institutional"
                title={
                  <AnimatedText as="span" id="directives-title" className="block">
                    The rules do not change. Time does.
                  </AnimatedText>
                }
                lede="Six articles, printed the way the authority prints everything: flat colour, hard geometry, one line that must be obeyed."
                aside={<Folio number="06" title="Directives" />}
              />
            </Reveal>
            <div className="mt-12 lg:mt-20">
              <Directives directives={directives} />
            </div>
          </Container>
        </Section>
      )}

      {features.nexusReport && (
        <Section id="report-nexus-event" surface="deep" aria-labelledby="report-title">
          <Container>
            <Reveal effect="rise">
              <SectionHeader
                index="07"
                eyebrow="Form NX-7 // Report a Nexus Event"
                title={
                  <AnimatedText as="span" id="report-title" className="block">
                    Declare an anomaly.
                  </AnimatedText>
                }
                lede="Something happened twice, or early, or not at all. File it here. The form validates what you enter; it does not transmit it anywhere."
                aside={<Folio number="07" title="Report a Nexus Event" />}
              />
            </Reveal>
            <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-x-8">
              <Reveal className="lg:col-span-8">
                <NexusReportForm branches={branches.map((b) => ({ id: b.id, label: b.label }))} categoryLabels={CATEGORY_LABELS} />
              </Reveal>
              <Reveal className="lg:col-span-4" delay={0.1}>
                <div className="border-l border-line pl-6 lg:sticky lg:top-24">
                  <p className="meta-label text-fg-subtle">How to file</p>
                  <ol className="mt-4 grid gap-4 font-mono text-mono text-fg-muted">
                    <li className="flex gap-4">
                      <span className="text-temporal-text">01</span>
                      <span>Identify yourself by callsign only. The desk does not need, and will not keep, a name.</span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-temporal-text">02</span>
                      <span>Name the branch and the kind of deviation. If unsure, choose the sacred timeline.</span>
                    </li>
                    <li className="flex gap-4">
                      <span className="text-temporal-text">03</span>
                      <span>Describe what you saw before you explain it. Understanding arrives later.</span>
                    </li>
                  </ol>
                  <Divider label="Notice" className="mt-6" />
                  <p className="mt-4 text-small text-fg-subtle">
                    No backend is connected. docs/ARCHITECTURE.md describes how to attach a service when one exists.
                  </p>
                </div>
              </Reveal>
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
