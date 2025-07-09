# **App Name**: Warehouse Navigator

## Core Features:

- Optimal Placement Algorithm: Calculates optimal product placement based on volume and a user-configurable 'popularity score' formula, respecting constraints like chain length and empty cell availability, using a deterministic ranking algorithm
- Warehouse Visualization: Presents a visual warehouse map with color-coded cells (green for empty, increasingly dark red for higher volume) showing column, row, and level details.
- New Product Entry: Allows users to input new products with name and volume, suggesting placement within the existing warehouse layout.
- Chain Shifting Mechanism: Implements a 'chain shifting' mechanism with user-defined length for relocating products, defaulting to a prompt to select an adjacent location when chainLength = 1. Offers flashing UI guidance for empty spots in green, orange, and red zones based on distance.
- Configurable Parameters: Supports configurable settings including: popularity score formula, color ranges for cell volume, default zone distances, and chain shift lengths. Implemented without any backend storage for configurations.
- Responsive Design: Supports responsive design for accessibility on various screen sizes including mobile devices.
- Cool Presentation: Creates a navigable HTML product presentation, describing how product works with slides

## Style Guidelines:

- Primary color: HSL(220, 60%, 60%) - A moderate blue (#4A7FC7), suggesting order and efficiency without being overly corporate.
- Background color: HSL(220, 20%, 95%) - Very light desaturated blue (#F0F2F5), providing a clean, uncluttered base for data presentation.
- Accent color: HSL(190, 70%, 40%) - A dark cyan (#20A3B7) to highlight key interactive elements.
- Font: 'Inter', a sans-serif font for a modern, machined, objective look for all headlines and body text.
- Use minimalist icons to represent product categories and actions, ensuring clarity and ease of understanding.
- Maintain a clean and structured layout using a grid system, providing clear visual separation between elements and ensuring optimal content spacing.
- Implement subtle transition animations for user interactions (e.g., when a product is selected or a placement is suggested), enhancing the user experience without being distracting.