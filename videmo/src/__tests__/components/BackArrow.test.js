import React from "react";

// Testing Libraries
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect"; 

// Components
import BackArrow from "../../components/BackArrow/BackArrow";


describe("BackArrow", () => {
    it("renders correctly", () => {
        const { container } = render(<BackArrow />);
        expect(container).toMatchSnapshot();
    });

    it("calls handleClick one time when clicked", () => {
        // Mock the handleClick function
        const mockHandleClick = jest.fn();

        // Render the BackArrow component with the mockHandleClick function
        render(<BackArrow handleClick={mockHandleClick} />);

        // Find the BackArrow component by its class name
        const backArrow = screen.getByRole("button");

        // Simulate a click event on the BackArrow component
        fireEvent.click(backArrow);

        // Expect that the mockHandleClick function was called once
        expect(mockHandleClick).toHaveBeenCalledTimes(1);
    });
});