import React from "react";

// Testing Libraries
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

// Components
import Dropdown from "../../components/Dropdown/Dropdown";

describe("Dropdown", () => {
    it("renders correctly", () => {
        const { container } = render(<Dropdown />);
        expect(container).toMatchSnapshot();
    });

    it("renders correctly with title and content", () => {
        const title = "Test Dropdown";
        const content = "Test Content";
        const { container } = render(<Dropdown title={title} content={content} />);
        expect(container).toMatchSnapshot();
    });

    it("Opens and closes the dropdown when clicked", () => {
        const title = "Test Dropdown";
        const content = "Test Content";
        render(<Dropdown title={title} content={content} />);

        const dropdownTitle = screen.getByText(title);
        const dropdownContent = screen.getByRole("group");

        // Initially, the content should be hidden and the dropdown should not have the "open" class
        expect(dropdownContent).toBeInTheDocument();
        expect(dropdownContent).not.toHaveClass("open");

        // Simulate click on the header to open the dropdown
        fireEvent.click(dropdownTitle);

        // After the click, the content should be visible and the dropdown should have the "open" class
        expect(dropdownContent).toBeInTheDocument();
        expect(dropdownContent).toHaveClass("open");

        // Click again to close the dropdown
        fireEvent.click(dropdownTitle);

        // After the second click, the content should be hidden again and the dropdown should not have the "open" class
        expect(dropdownContent).toBeInTheDocument();
        expect(dropdownContent).not.toHaveClass("open");
    });
});