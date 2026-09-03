import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge, RiskBadge, PriorityBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusMessage } from "@/components/ui/status-message";

describe("Frontend Core UI Components", () => {
  it("renders primary Button with label", () => {
    render(<Button variant="primary">Launch Workspace</Button>);
    expect(screen.getByText("Launch Workspace")).toBeDefined();
  });

  it("renders RiskBadge correctly based on risk level", () => {
    const { rerender } = render(<RiskBadge risk="Critical Risk" />);
    expect(screen.getByText("Critical Risk")).toBeDefined();

    rerender(<RiskBadge risk="Low Risk" />);
    expect(screen.getByText("Low Risk")).toBeDefined();
  });

  it("renders PriorityBadge correctly", () => {
    render(<PriorityBadge priority="High" />);
    expect(screen.getByText("High Priority")).toBeDefined();
  });

  it("renders ProgressBar with value percentage", () => {
    render(<ProgressBar label="Aptitude Score" value={78} max={100} />);
    expect(screen.getByText("Aptitude Score")).toBeDefined();
    expect(screen.getByText("78%")).toBeDefined();
  });

  it("renders MetricCard with title, value, and trend", () => {
    render(
      <MetricCard
        title="Predicted CGPA"
        value="8.64"
        subValue="/ 10"
        trend="improving"
        trendLabel="Improving (+0.04)"
      />
    );
    expect(screen.getByText("Predicted CGPA")).toBeDefined();
    expect(screen.getByText("8.64")).toBeDefined();
    expect(screen.getByText("Improving (+0.04)")).toBeDefined();
  });

  it("renders StatusMessage with informative text", () => {
    render(
      <StatusMessage kind="success" title="Analysis Complete">
        Your academic regression forecast has been computed.
      </StatusMessage>
    );
    expect(screen.getByText("Analysis Complete")).toBeDefined();
    expect(screen.getByText("Your academic regression forecast has been computed.")).toBeDefined();
  });
});
