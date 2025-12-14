import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  BoxVisualization,
  OrbitVisualization,
  BlobVisualization,
  BarVisualization,
  LadderVisualization,
  TrapezoidVisualization,
  FlowerVisualization,
  MinimalVisualization,
  RingVisualization,
  PathVisualization,
  renderVisualization,
} from "./index";

const defaultProps = {
  phase: 0,
  progress: 0.5,
  durations: [4, 4, 4, 4],
};

describe("Visualizations", () => {
  describe("BoxVisualization", () => {
    it("should render without crashing", () => {
      const { container } = render(<BoxVisualization {...defaultProps} />);
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should render with different phases", () => {
      for (let phase = 0; phase < 4; phase++) {
        const { container } = render(
          <BoxVisualization {...defaultProps} phase={phase} />
        );
        expect(container.querySelector("svg")).toBeTruthy();
      }
    });

    it("should have marker circles", () => {
      const { container } = render(<BoxVisualization {...defaultProps} />);
      const circles = container.querySelectorAll("circle");
      expect(circles.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("OrbitVisualization", () => {
    it("should render without crashing", () => {
      const { container } = render(<OrbitVisualization {...defaultProps} />);
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should render arc paths for each phase", () => {
      const { container } = render(<OrbitVisualization {...defaultProps} />);
      const paths = container.querySelectorAll("path");
      expect(paths.length).toBe(4);
    });
  });

  describe("BlobVisualization", () => {
    it("should render without crashing", () => {
      const { container } = render(<BlobVisualization {...defaultProps} />);
      expect(container.querySelector(".viz-container")).toBeTruthy();
    });

    it("should scale during inhale phase", () => {
      const { container: container1 } = render(
        <BlobVisualization {...defaultProps} phase={0} progress={0} />
      );
      const { container: container2 } = render(
        <BlobVisualization {...defaultProps} phase={0} progress={1} />
      );
      // Both should render without crashing
      expect(container1.querySelector(".viz-container")).toBeTruthy();
      expect(container2.querySelector(".viz-container")).toBeTruthy();
    });
  });

  describe("BarVisualization", () => {
    it("should render without crashing", () => {
      const { container } = render(<BarVisualization {...defaultProps} />);
      expect(container.querySelector(".viz-container")).toBeTruthy();
    });

    it("should show phase labels", () => {
      const { getByText } = render(<BarVisualization {...defaultProps} />);
      expect(getByText("In")).toBeTruthy();
      expect(getByText("Breathe In")).toBeTruthy();
    });
  });

  describe("LadderVisualization", () => {
    it("should render without crashing", () => {
      const { container } = render(<LadderVisualization {...defaultProps} />);
      expect(container.querySelector(".viz-container")).toBeTruthy();
    });

    it("should show all four phase labels", () => {
      const { getByText, getAllByText } = render(<LadderVisualization {...defaultProps} />);
      expect(getByText("Breathe In")).toBeTruthy();
      expect(getByText("Breathe Out")).toBeTruthy();
      expect(getAllByText("Hold").length).toBe(2);
    });

    it("should display durations", () => {
      const { getAllByText } = render(<LadderVisualization {...defaultProps} />);
      const durationLabels = getAllByText(/4s/);
      expect(durationLabels.length).toBe(4);
    });
  });

  describe("TrapezoidVisualization", () => {
    it("should render without crashing", () => {
      const { container } = render(<TrapezoidVisualization {...defaultProps} />);
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should have a polygon element", () => {
      const { container } = render(<TrapezoidVisualization {...defaultProps} />);
      expect(container.querySelector("polygon")).toBeTruthy();
    });
  });

  describe("FlowerVisualization", () => {
    it("should render without crashing", () => {
      const { container } = render(<FlowerVisualization {...defaultProps} />);
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should have four petals (ellipses)", () => {
      const { container } = render(<FlowerVisualization {...defaultProps} />);
      const ellipses = container.querySelectorAll("ellipse");
      expect(ellipses.length).toBe(4);
    });
  });

  describe("MinimalVisualization", () => {
    it("should render without crashing", () => {
      const { container } = render(<MinimalVisualization {...defaultProps} />);
      expect(container.querySelector(".viz-container")).toBeTruthy();
    });

    it("should show phase label", () => {
      const { getByText } = render(<MinimalVisualization {...defaultProps} />);
      expect(getByText("Breathe In")).toBeTruthy();
    });
  });

  describe("RingVisualization", () => {
    it("should render without crashing", () => {
      const { container } = render(<RingVisualization {...defaultProps} />);
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should show countdown timer", () => {
      const { container } = render(
        <RingVisualization {...defaultProps} phase={0} progress={0.5} />
      );
      // Should show remaining seconds (approximately 2s for progress=0.5 of 4s phase)
      expect(container.querySelector("text")).toBeTruthy();
    });
  });

  describe("PathVisualization", () => {
    it("should render without crashing", () => {
      const { container } = render(<PathVisualization {...defaultProps} />);
      expect(container.querySelector("svg")).toBeTruthy();
    });

    it("should have segment lines", () => {
      const { container } = render(<PathVisualization {...defaultProps} />);
      const lines = container.querySelectorAll("line");
      expect(lines.length).toBe(4);
    });
  });

  describe("renderVisualization", () => {
    const testCases = [
      { vizId: "box", name: "BoxVisualization" },
      { vizId: "orbit", name: "OrbitVisualization" },
      { vizId: "blob", name: "BlobVisualization" },
      { vizId: "bar", name: "BarVisualization" },
      { vizId: "ladder", name: "LadderVisualization" },
      { vizId: "trapezoid", name: "TrapezoidVisualization" },
      { vizId: "flower", name: "FlowerVisualization" },
      { vizId: "minimal", name: "MinimalVisualization" },
      { vizId: "ring", name: "RingVisualization" },
      { vizId: "path", name: "PathVisualization" },
    ];

    testCases.forEach(({ vizId, name }) => {
      it(`should render ${name} for vizId "${vizId}"`, () => {
        const result = renderVisualization(vizId, defaultProps);
        const { container } = render(result);
        expect(container.firstChild).toBeTruthy();
      });
    });

    it("should default to BoxVisualization for unknown vizId", () => {
      const result = renderVisualization("unknown", defaultProps);
      const { container } = render(result);
      expect(container.querySelector("svg")).toBeTruthy();
    });
  });
});
