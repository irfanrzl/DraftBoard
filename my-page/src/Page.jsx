import React from "react";
import { layout } from "./layout.js";
import Nav from "./blocks/Nav.jsx";
import Hero from "./blocks/Hero.jsx";
import Grid from "./blocks/Grid.jsx";
import Feature from "./blocks/Feature.jsx";
import Cta from "./blocks/Cta.jsx";
import Footer from "./blocks/Footer.jsx";

const BLOCKS = { nav: Nav, hero: Hero, grid: Grid, feature: Feature, cta: Cta, footer: Footer };

export default function Page() {
  return (
    <div className="page">
      {layout.blocks.map((block, i) => {
        const Component = BLOCKS[block.type];
        if (!Component) return null;
        return <Component key={i} block={block} site={layout} />;
      })}
    </div>
  );
}
