
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

import InquiryForm from "./InquiryForm";

describe("InquiryForm", () => {
  it("does not submit when required fields are empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<InquiryForm onSubmit={onSubmit} />);

    await user.click(
      screen.getByRole("button", { name: /submit|create inquiry/i })
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
