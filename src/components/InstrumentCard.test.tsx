import { test, expect } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { App } from "../App";

test("clicking instrument card on home page navigates to instrument page", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );

  // Verify we're on the home page
  expect(screen.getByText("Practice Better")).toBeTruthy();
  expect(screen.getByText("What are we practicing today?")).toBeTruthy();

  // Find and click the Piano card
  const pianoCard = screen.getByText("Piano").closest("div[class*='cursor-pointer']");
  expect(pianoCard).toBeTruthy();

  fireEvent.click(pianoCard!);

  // Verify we navigated to the instrument page
  expect(screen.getByText("piano")).toBeTruthy();
  expect(screen.getByText("Practice page for piano")).toBeTruthy();
  expect(screen.getByText("← Back to instruments")).toBeTruthy();
});
