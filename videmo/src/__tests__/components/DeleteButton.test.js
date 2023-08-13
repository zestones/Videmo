import React from "react";

// Testing Libraries
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect"; 

// Components
import DeleteButton from "../../components/DeleteButton/DeleteButton";


describe("DeleteButton", () => {
    it("renders correctly", () => {
        const { container } = render(<DeleteButton />);
        expect(container).toMatchSnapshot();
    });

    it("calls handleClick when clicked", () => {
        // Mock the handleClick function
        const mockOnClick = jest.fn();

        // Render the DeleteButton component with the mockOnClick function
        render(<DeleteButton onClick={mockOnClick} />);

        // Find the DeleteButton component by its class name
        const backArrow = screen.getByRole("button");

        // Simulate a click event on the DeleteButton component
        fireEvent.click(backArrow);

        // Expect that the mockOnClick function was called once
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
});