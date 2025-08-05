export interface SiteConfig {
  title: string;
  description: string;
  author: {
    name: string;
    bio: string;
    avatar?: string;
  };
  social: {
    github?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    email?: string;
  };
  siteUrl: string;
}

export const config: SiteConfig = {
  title: "Swanage Traffic Alliance",
  description: "Demanding accountability from local authorities. The democratic process has been warped for personal gain.",
  author: {
    name: "Swanage Traffic Alliance",
    bio: "A collective of residents demanding transparency and accountability in local traffic management decisions.",
    // avatar: "/images/avatar.jpg" // Uncomment and add your avatar image to public/images/
  },
  social: {
    // github: "", // Removed as per spec
    // twitter: "", // Removed as per spec
    email: "contact@swanagetraffic.co.uk"
  },
  siteUrl: "https://www.swanagetraffic.co.uk"
};

// Export constants for SEO component
export const SITE_TITLE = config.title;
export const SITE_DESCRIPTION = config.description;