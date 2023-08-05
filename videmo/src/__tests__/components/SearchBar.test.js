import React from "react";

// Testing Libraries
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

// Components
import SearchBar from "../../components/SearchBar/SearchBar";


describe("SearchBar", () => {
    test("renders correctly", () => {
        const { container } = render(<SearchBar />);
        expect(container).toMatchSnapshot();
    });

    test("search input activates and deactivates correctly", () => {
        render(<SearchBar />);

        const searchIconElement = screen.getByTestId("search-icon");
        expect(screen.queryByPlaceholderText("Rechercher")).not.toBeInTheDocument();

        // Clicking the search icon should activate the search input
        fireEvent.click(searchIconElement);
        const searchInputElement = screen.getByPlaceholderText("Rechercher");
        expect(searchInputElement).toBeInTheDocument();

        // Blurring the search input with empty value should deactivate it
        fireEvent.blur(searchInputElement);
        expect(screen.queryByPlaceholderText("Rechercher")).not.toBeInTheDocument();
    });

    test("calls onSearch prop when search input value changes", () => {
        const mockOnSearch = jest.fn();
        render(<SearchBar onSearch={mockOnSearch} />);

        const searchIconElement = screen.getByTestId("search-icon");
        fireEvent.click(searchIconElement);

        const searchInputElement = screen.getByPlaceholderText("Rechercher");
        fireEvent.change(searchInputElement, { target: { value: "test" } });

        expect(mockOnSearch).toHaveBeenCalledTimes(1);
        expect(mockOnSearch).toHaveBeenCalledWith("test");

        // Clearing the search input value should call onSearch with an empty string
        fireEvent.change(searchInputElement, { target: { value: "" } });

        expect(mockOnSearch).toHaveBeenCalledTimes(2);
        expect(mockOnSearch).toHaveBeenCalledWith("");
    });

    test("component works without onSearch prop", () => {
        render(<SearchBar />);
        const searchIconElement = screen.getByTestId("search-icon");
        fireEvent.click(searchIconElement);
        const searchInputElement = screen.getByPlaceholderText("Rechercher");
        expect(searchInputElement).toBeInTheDocument();
    });
});
