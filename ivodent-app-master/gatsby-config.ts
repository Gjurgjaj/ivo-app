import type { GatsbyConfig } from "gatsby";

import dotenv from "dotenv";

dotenv.config({
  path: `.env`,
});

const config: GatsbyConfig = {
  siteMetadata: {
    title: "Ivodent App",
    siteUrl: "https://app.ivodent.edu.al/",
    description:
      "Ivodent Academy is an Albanian accredited higher institution specializing in dental technology. The Academy is accredited from the Albanian Quality Assurance Agency of Higher Education.",
    image: "./images/logo.png",
  },
  graphqlTypegen: true,
  plugins: [
    "gatsby-plugin-sass",
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sitemap",
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    "gatsby-plugin-offline",
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        icon: "src/images/logo.png",
      },
    },
    {
      resolve: "gatsby-plugin-alias-imports",
      options: {
        alias: {
          "@ui": "src/components/UI/index.tsx",
          "@icon": "src/components/CustomIcons.tsx",
          "@components": "src/components",
          "@styles": "src/styles",
          "@utils": "src/utils",
          "@interface": "src/interface",
          "@data": "src/data",
        },
      },
    },
    // {
    //   resolve: "gatsby-plugin-google-analytics",
    //   options: {
    //     trackingId: "",
    //   },
    // },
  ],
};

export default config;
