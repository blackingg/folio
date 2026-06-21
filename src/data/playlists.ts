export type PlaylistConfig = {
  slug: string;
  title: string;
  description: string;
  postSlugs: string[];
};

export const PLAYLISTS: PlaylistConfig[] = [
  {
    slug: "sidequesting-3d",
    title: "Sidequesting 3D",
    description: "A series chronicling my journey through the world of 3D development.",
    postSlugs: [
      "embedding-bruno-simons-infinite-terrain-into-my-portfolio-work-in-progress-fc9e16c318d3",
    ],
  },
];
