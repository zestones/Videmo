import React from "react";

// Testing Libraries
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

// Components
import RandButton from "../../components/RandButton/RandButton";


describe("RandButton", () => {
    // Test case 1: Check if the button renders correctly
    test("renders button with ShuffleIcon", () => {
        render(<RandButton />);
        const buttonElement = screen.getByRole("button");
        expect(buttonElement).toBeInTheDocument();
    });

    // Test case 2: Check if the onClick function is called when the button is clicked
    test("calls onClick function when button is clicked", () => {
        const mockOnClick = jest.fn();
        render(<RandButton onClick={mockOnClick} />);
        const buttonElement = screen.getByRole("button");
        fireEvent.click(buttonElement);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
});