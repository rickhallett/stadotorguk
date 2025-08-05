# Swanage Traffic Alliance

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/small.svg)](https://astro.build)

## 📣 Demanding Accountability

The Swanage Traffic Alliance is a community-driven initiative demanding transparency and accountability from local authorities regarding traffic management decisions. We believe the democratic process has been warped for personal gain, and we're here to present evidence and amplify community voices.

## 🎯 Project Purpose

This website serves as a platform for:
- **Community Voice Amplification** - Collecting and presenting resident concerns about traffic issues
- **Evidence Presentation** - Documenting the impact of traffic decisions on our community
- **Accountability Tracking** - Monitoring local authority responses and actions
- **Community Mobilization** - Building momentum for positive change

## 🛠️ Technical Stack

Built with modern web technologies:
- **Framework**: Astro 5.x
- **Styling**: Scoped CSS with CSS Variables
- **Content**: Dynamic community feeds and impact visualization
- **APIs**: Serverless endpoints for real-time data

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/swanage-traffic/alliance-website.git

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Add your API keys to .env
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔑 Environment Variables

Create a `.env` file with:
```
NOTION_TOKEN=your_notion_token
NOTION_DATABASE_ID=your_database_id
ANTHROPIC_API_KEY=your_anthropic_key
```

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── home/         # Homepage components
│   │   └── feeds/        # Feeds page components
│   ├── pages/
│   │   ├── api/          # Serverless API endpoints
│   │   ├── index.astro   # Homepage
│   │   └── feeds.astro   # Community feeds
│   └── config.ts         # Site configuration
├── public/               # Static assets
└── .env                  # Environment variables
```

## 🤝 Contributing

We welcome contributions from the community. Please feel free to submit issues, feature requests, or pull requests.

## 📧 Contact

For inquiries: contact@swanagetraffic.co.uk

---

*Built by the community, for the community.*