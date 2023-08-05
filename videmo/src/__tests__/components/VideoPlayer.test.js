import React from "react";

// Testing Libraries
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";

// Components
import VideoPlayer from "../../components/VideoPlayer/VideoPlayer";


describe("VideoPlayer", () => {
    test("renders correctly", () => {
        const { container } = render(<VideoPlayer />);
        expect(container).toMatchSnapshot();
    });
});
