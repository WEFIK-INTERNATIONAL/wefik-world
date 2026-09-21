import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder-sanity-id';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

export default defineConfig({
  basePath: '/studio',
  name: 'wefik-world-studio',
  title: 'wefik.world Content Studio',
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: {
    types: [],
  },
});
