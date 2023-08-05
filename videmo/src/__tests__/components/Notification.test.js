import React from "react";

// Testing Libraries
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

// Components
import Notification from "../../components/Notification/Notification";


test('Error notification should render with correct content', () => {
    const message = 'This is an error message.';
    render(<Notification type="error" message={message} />);

    const title = screen.getByText('An error occurred!');
    const messageText = screen.getByText(message);
    const closeButton = screen.getByLabelText('close');

    expect(title).toBeInTheDocument();
    expect(messageText).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
});

test('Warning notification should render with correct content', () => {
    const message = 'This is a warning message.';
    render(<Notification type="warning" message={message} />);

    const title = screen.getByText('Dangerous action!');
    const messageText = screen.getByText(message);
    const closeButton = screen.getByLabelText('close');

    expect(title).toBeInTheDocument();
    expect(messageText).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
});

test('Success notification should render with correct content', () => {
    const message = 'This is a success message.';
    render(<Notification type="success" message={message} />);

    const title = screen.getByText('Success! Everything is fine.');
    const messageText = screen.getByText(message);
    const closeButton = screen.getByLabelText('close');

    expect(title).toBeInTheDocument();
    expect(messageText).toBeInTheDocument();
    expect(closeButton).toBeInTheDocument();
});


test('Notification should auto-close after 5 seconds', () => {
    jest.useFakeTimers();

    const message = 'This is an auto-close message.';
    const onClose = jest.fn();
    render(<Notification type="success" message={message} onClose={onClose} />);

    // Before 5 seconds
    expect(onClose).not.toHaveBeenCalled();
    // Move forward 5 seconds in time
    act(() => {
        jest.advanceTimersByTime(5000);
    });
    // After 5 seconds, the onClose function should be called
    expect(onClose).toHaveBeenCalledTimes(1);
});

