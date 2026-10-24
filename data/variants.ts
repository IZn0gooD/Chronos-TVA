import type { Variant, VariantCategory, VariantStatus } from "@/types/content";

/**
 * The Variant Registry. Fictional cases written for this interface; every
 * date, sector and analyst is invented. Edit here, never in the components.
 */
export const variants: readonly Variant[] = [
  {
    id: "VR-0427",
    name: "The Clockmaker of Sector 12",
    status: "monitored",
    category: "temporal",
    summary: "A watch repairer whose repairs are complete one tick before the fault occurs.",
    detail:
      "Forty-one timepieces brought to the shop since the file opened. In each case the repair log is dated before the owner noticed the fault. The repairer keeps meticulous records and has never been wrong. Observation continues; no intervention recommended while the error stays under one tick.",
    figure: "diagram",
    meta: { sector: "12 / Horology", opened: "1962.044", analyst: "Desk 07" },
  },
  {
    id: "VR-1138",
    name: "Recurring Tuesday",
    status: "contained",
    category: "temporal",
    summary: "The same Tuesday, filed forty-one times under forty-one different dates.",
    detail:
      "A municipal archive holds forty-one identical days: same weather report, same tram delay, same lost umbrella returned at 16:10. The clerks remember each one as distinct. The archive is sealed and the Tuesday is held at its last filing. Nothing has recurred since.",
    figure: "typographic",
    meta: { sector: "03 / Records", opened: "1962.117", analyst: "Desk 02" },
  },
  {
    id: "VR-2301",
    name: "Echo Garden",
    status: "monitored",
    category: "biological",
    summary: "Greenhouse plants that bloom in the order they will later be cut.",
    detail:
      "The gardener plans the bouquets a week ahead; the beds flower in that order the morning after she writes the plan. Growth rates are otherwise normal. A control bed, planned by a clerk who does not garden, flowers at random. The garden is visited weekly.",
    figure: "ascii",
    art: "fern",
    meta: { sector: "19 / Botany", opened: "1963.008", analyst: "Desk 11" },
  },
  {
    id: "VR-0882",
    name: "Twin Ledger",
    status: "escalated",
    category: "administrative",
    summary: "Two ledgers of one office that balance only when read together.",
    detail:
      "Each ledger alone shows a deficit; side by side, every column closes to zero. The entries are in two hands, neither belonging to a known employee. Escalated after the second ledger acquired a third column that the first does not have yet.",
    figure: "geometric",
    meta: { sector: "01 / Accounts", opened: "1961.300", analyst: "Desk 01" },
  },
  {
    id: "VR-3049",
    name: "Half-Second Lighthouse",
    status: "pruned",
    category: "technological",
    summary: "A coastal beacon whose light reached the shore before the lamp was lit.",
    detail:
      "Measured lead of 0.5 seconds, consistent over three winters. Ships adjusted. The lamp was replaced with a calibrated unit in 1961.212 and the branch closed without incident; the keeper reports the new light feels late.",
    figure: "diagram",
    meta: { sector: "27 / Signals", opened: "1960.198", analyst: "Desk 05" },
  },
  {
    id: "VR-0199",
    name: "Unsent Telegram",
    status: "pruned",
    category: "administrative",
    summary: "A telegram delivered to the recipient's grandfather, who understood it.",
    detail:
      "The message concerned a meeting in 1962 and was received in 1911. The grandfather kept the appointment, which is how the family came to own the café where the meeting took place. The branch was folded back; the café remains.",
    figure: "typographic",
    meta: { sector: "08 / Post", opened: "1962.201", analyst: "Desk 02" },
  },
  {
    id: "VR-4410",
    name: "Cartographer's Shadow",
    status: "contained",
    category: "biological",
    summary: "A surveyor whose shadow records the map as it will be, not as it is.",
    detail:
      "Photographs of the subject at noon show streets that do not exist yet; the city built them within the year each time. The subject has been reassigned to indoor work. Shadow length remains correct to the minute.",
    figure: "field",
    field: "shadow",
    meta: { sector: "14 / Survey", opened: "1963.033", analyst: "Desk 09" },
  },
  {
    id: "VR-5155",
    name: "Loop Reactor Mk II",
    status: "escalated",
    category: "technological",
    summary: "An engine that runs on the second after it is switched off.",
    detail:
      "The prototype produces output only once the operator has cut the power, drawing on an interval that has not happened yet. Net energy is zero over any whole minute and positive over any half minute. Escalated: the operators have started switching it off more often.",
    figure: "field",
    field: "reactor",
    meta: { sector: "22 / Power", opened: "1963.071", analyst: "Desk 04" },
  },
];

export const STATUS_LABELS: Record<VariantStatus, string> = {
  monitored: "Monitored",
  contained: "Contained",
  pruned: "Pruned",
  escalated: "Escalated",
};

export const CATEGORY_LABELS: Record<VariantCategory, string> = {
  temporal: "Temporal",
  biological: "Biological",
  technological: "Technological",
  administrative: "Administrative",
};
