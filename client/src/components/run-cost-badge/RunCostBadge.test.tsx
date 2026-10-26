import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "../../../messages/en/prReview.json";
import { RunCostBadge, type RunCostBadgeProps } from "./RunCostBadge";

afterEach(cleanup);

function renderBadge(props: RunCostBadgeProps) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      <RunCostBadge {...props} />
    </NextIntlClientProvider>,
  );
}

describe("RunCostBadge", () => {
  it("compact: PR total at up to 3 decimals", () => {
    renderBadge({ variant: "compact", usd: 0.014 });
    expect(screen.getByText("$0.014")).toBeInTheDocument();
  });

  it("compact: unknown cost is a dash, not $0.00", () => {
    renderBadge({ variant: "compact", usd: null });
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.queryByText(/\$0\.00/)).not.toBeInTheDocument();
  });

  it("tokens: total tokens with thousands separator + cost at up to 4 decimals", () => {
    const { container } = renderBadge({ variant: "tokens", usd: 0.0013, tokensIn: 8000, tokensOut: 1119 });
    expect(container.textContent).toBe("9,119 tok · $0.0013");
  });

  it("tokens: unknown cost keeps the tokens and shows a dash", () => {
    const { container } = renderBadge({ variant: "tokens", usd: null, tokensIn: 8000, tokensOut: 457 });
    expect(container.textContent).toBe("8,457 tok · —");
  });
});
