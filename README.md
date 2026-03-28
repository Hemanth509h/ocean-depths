# 🌊 Ocean Depths – Fear of the Deep

An immersive, cinematic, and technically advanced interactive storytelling experience that simulates a descent from the ocean surface to the deepest point on Earth: the Challenger Deep.

![Ocean Depths Screenshot](https://raw.githubusercontent.com/Hemanth509h/ocean-depths/main/public/og-image.png)

## 🚢 Experience the Descent
"Ocean Depths" is more than just a website; it's a sensory journey. As you scroll, the environment around you physicalizes the increasing pressure and decreasing light of the deep ocean.

### 🛠️ Core Features
- **Continuous Depth Engine**: Every pixel of scroll is translated into realistic environmental changes (brightness, saturation, and blur).
- **Dynamic HUD**: A real-time heads-up display tracking your depth in meters, ambient pressure in atmospheres, and descent velocity.
- **Atmospheric Audio**: Layered, zone-aware ambient sounds that shift from the surface's breeze to the abyss's crushing silence.
- **Procedural Particle Systems**: A custom Three.js and Canvas-based particle engine simulating "marine snow" and bioluminescent life.
- **Zone-Based Storytelling**: Explore five distinct oceanic zones, each with unique creatures, facts, and visual aesthetics.
- **Cinematic Polish**: Smooth scrolling (Lenis), GSAP-powered reveals, and high-performance React architecture.

## 🧪 Technical Stack
*   **Framework**: [React](https://reactjs.org/) (Vite)
*   **Animations**: [GSAP](https://greensock.com/gsap/) & [Lenis](https://lenis.darkroom.engineering/) (Smooth Scroll)
*   **Visuals**: [Three.js](https://threejs.org/) & HTML5 Canvas
*   **Audio**: [Howler.js](https://howlerjs.com/)
*   **Styling**: Modern CSS with HSL-driven dynamic design tokens.
*   **Deployment**: Optimized for [Vercel](https://vercel.com/).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Hemanth509h/ocean-depths.git
    cd ocean-depths
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm run dev
    ```

4.  **Build for production**:
    ```bash
    npm run build
    ```

## 🌌 Atmospheric Zones
1.  **Sunlight Zone (0 – 200m)**: The world we know. Life, light, and movement.
2.  **Twilight Zone (200 – 1,000m)**: Where light dies. Only a dim blue glow remains.
3.  **Midnight Zone (1,000 – 4,000m)**: Total darkness. The pressure is immense.
4.  **Abyssal Zone (4,000 – 6,000m)**: The void. Temperatures are near freezing.
5.  **The Trenches (6,000m+ )**: The final frontier. Challenger Deep.

---

*“In the deep sea, the most common sound is silence — broken only by creatures we don't yet have names for.”*
