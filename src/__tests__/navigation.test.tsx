import { test, expect } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { App } from "../App";

test("clicking instrument card navigates to practice page", () => {
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

  // Verify we navigated to the practice page
  expect(screen.getByText("Practice piano")).toBeTruthy();
  expect(screen.getByText("TODO: Add practice content here")).toBeTruthy();
});

test("clicking gear icon navigates to edit page", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  );

  // Verify we're on the home page
  expect(screen.getByText("Practice Better")).toBeTruthy();
  expect(screen.getByText("What are we practicing today?")).toBeTruthy();

  // Find the Piano card and then find its gear icon
  const pianoCard = screen.getByText("Piano").closest("div[class*='cursor-pointer']");
  expect(pianoCard).toBeTruthy();

  const gearButton = pianoCard!.querySelector('button[aria-label="Edit instrument"]');
  expect(gearButton).toBeTruthy();

  fireEvent.click(gearButton!);

  // Verify we navigated to the edit page
  expect(screen.getByText("Edit piano")).toBeTruthy();
  expect(screen.getByText("TODO: Add edit form here")).toBeTruthy();
});
