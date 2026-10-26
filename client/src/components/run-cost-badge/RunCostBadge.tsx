/* RunCostBadge — what a review cost, in two shapes: `compact` for the PR list
   cell ("$0.014") and `tokens` for a timeline run row ("9,119 tok · $0.0013").
   An unknown cost always renders "—", never "$0.00". */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { formatUsd } from "@/lib/format-cost";
import { s } from "./styles";

type Usd = number | null | undefined;

export type RunCostBadgeProps =
  | { variant: "compact"; usd: Usd }
  | { variant: "tokens"; usd: Usd; tokensIn: number | null; tokensOut: number | null };

export function RunCostBadge(props: RunCostBadgeProps) {
  const t = useTranslations("prReview");
  const unknown = props.usd == null;

  if (props.variant === "compact") {
    return (
      <span className="mono" style={s.compact(unknown)}>
        {formatUsd(props.usd, 3)}
      </span>
    );
  }

  const tokens = (props.tokensIn ?? 0) + (props.tokensOut ?? 0);
  return (
    <span className="mono" style={s.tokens}>
      {t("cost.tokens", { count: tokens })} ·{" "}
      <span style={unknown ? s.unknown : undefined}>{formatUsd(props.usd, 4)}</span>
    </span>
  );
}
