# 📦 Warehouse Navigator

**Warehouse Navigator** is a powerful tool designed to optimize product placement and management within a warehouse environment. It provides intelligent algorithms for placement, intuitive visualization, and flexible shifting mechanisms to enhance operational efficiency.

---

## 📂 Getting Started

- **Main Page:**
  The application starts at [`src/app/page.tsx`](/src/app/page.tsx).

- **Core Logic:**
  Key functionalities are implemented within the components and utility functions located in the [`src/components`](/src/components), [`src/contexts`](/src/contexts), and [`src/lib`](/src/lib) directories.

---

## ✨ Features

- **Optimal Placement Algorithm:**
  Calculates the best placement for new products based on volume and a customizable 'popularity score'. This deterministic algorithm considers factors like available space and chain length constraints for efficient stocking.

- **Warehouse Visualization:**
  Provides a clear, color-coded visual map of your warehouse floor. Cells are colored based on volume (green for empty, transitioning to dark red for higher volume), with detailed information on column, row, and level.

- **New Product Entry:**
  Easily add new products by specifying their name and volume. The system will suggest optimal placement locations based on the current warehouse state.

- **Chain Shifting Mechanism:**
  Implement flexible product relocation using a 'chain shifting' method with a user-defined length. For single product shifts (`chainLength = 1`), the UI guides you to adjacent empty locations. The interface visually highlights empty spots in green, orange, and red zones based on distance for easy identification.
  - Visualize single product shifts with `docs/optimal-placement.png`.
  - See the impact of global shifts across the entire floor with `docs/ideal-warehouse-state.png`.
  - Visualize single product shifts with ![Optimal Placement Shift](/docs/optimal-placement.png).
  - See the impact of global shifts across the entire floor with ![Ideal Warehouse State Global Shift](/docs/ideal-warehouse-state.png).

- **Configurable Parameters:**
  Tailor the application to your needs with customizable settings, including the popularity score formula, volume-based cell color ranges, default zone distances, and chain shift lengths. All configurations are handled client-side without backend storage.

- **Responsive Design:**
  Access and manage your warehouse efficiently on any device, thanks to a responsive design that adapts to various screen sizes, including mobile phones.

- **Interactive Presentation:**
  Explore an engaging HTML presentation at [`src/app/presentation/page.tsx`](/src/app/presentation/page.tsx) that walks you through the application's features and workflow.