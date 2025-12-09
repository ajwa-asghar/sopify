# SOPify - Automated SOP Generator

Transform operational incidents into structured, actionable, visual Standard Operating Procedures in seconds.

## 🚀 Features

- **Instant SOP Generation**: Convert incidents to structured SOPs using AI
- **Visual Interface**: Clean, enterprise-grade UI with interactive elements
- **Compliance Metrics**: Real-time charts and efficiency tracking
- **Export Options**: PDF, Word, and HTML formats with formatting
- **Interactive Checklists**: Track completion with visual progress
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **AI Integration**: Google Gemini API
- **Charts**: Chart.js, React Chart.js 2
- **Export**: jsPDF, docx
- **Icons**: Lucide React
- **Deployment**: Vercel/Railway ready

## 📋 Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn package manager
- Google AI Studio API key (Gemini)

## 🚀 Quick Start

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd SOPify
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Set Up Environment Variables

\`\`\`bash
cp env.template .env.local
\`\`\`

Edit \`.env.local\` and add your Gemini API key:

\`\`\`env
GEMINI_API_KEY=your_actual_gemini_api_key_here
NODE_ENV=development
PORT=3000
\`\`\`

### 4. Get a Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your \`.env.local\` file

### 5. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. **Install Vercel CLI** (optional):
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. **Deploy via GitHub** (easiest):
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Add your \`GEMINI_API_KEY\` in Vercel environment variables
   - Deploy automatically

3. **Deploy via CLI**:
   \`\`\`bash
   vercel --prod
   \`\`\`

4. **Environment Variables in Vercel**:
   - Go to your project settings in Vercel
   - Add \`GEMINI_API_KEY\` with your actual key
   - Redeploy the project

### Deploy to Railway

1. **Connect Repository**:
   - Visit [Railway](https://railway.app/)
   - Create a new project from GitHub repo

2. **Add Environment Variables**:
   \`\`\`
   GEMINI_API_KEY=your_actual_key_here
   NODE_ENV=production
   \`\`\`

3. **Deploy**:
   - Railway will automatically build and deploy

## 📱 Usage Guide

### 1. Report an Incident
- Select incident type from dropdown
- Choose severity level (Low/Medium/High)
- Pick actions already taken (multi-select)
- Add optional description details
- Click "Generate SOP"

### 2. Review Generated SOP
- View structured SOP with visual cards
- Toggle completion status for each step
- Track progress with completion bar
- Expand/collapse preventive actions

### 3. Export & Share
- Export as PDF with formatting
- Export as Word document
- Export as interactive HTML checklist
- Copy data for integration

### 4. Monitor Metrics
- View compliance rates
- Track efficiency improvements
- Analyze incident patterns
- Monitor resolution times

## 🎨 UI Components

### Core Components
- **IncidentForm**: Structured incident input
- **SOPDisplay**: Visual SOP with interactive elements
- **MetricsPanel**: Charts and compliance tracking
- **Header**: Navigation and key stats

### Design Features
- Clean, minimalistic interface
- Color-coded severity levels
- Smooth animations and transitions
- Responsive grid layouts
- Interactive charts and graphs

## 🔧 Configuration

### API Routes
- \`/api/generate-sop\` - Generate SOP from incident
- \`/api/export\` - Export SOP to various formats
- \`/api/metrics\` - Fetch analytics and metrics

### Environment Variables
- \`GEMINI_API_KEY\`: Required for AI SOP generation
- \`NODE_ENV\`: Environment mode (development/production)
- \`PORT\`: Development server port (default: 3000)

## 📊 Data Structure

### Incident Type
\`\`\`typescript
interface Incident {
  id: string;
  type: IncidentType;
  severity: Severity;
  actionsTaken: ActionType[];
  description?: string;
  timestamp: string;
}
\`\`\`

### SOP Structure
\`\`\`typescript
interface SOP {
  id: string;
  title: string;
  trigger: string;
  immediateSteps: SOPStep[];
  preventiveActions: SOPStep[];
  responsibleTeam: string;
  severity: Severity;
  incidentType: IncidentType;
  createdAt: string;
}
\`\`\`

## 🔍 Troubleshooting

### Common Issues

1. **API Key Error**:
   - Ensure \`GEMINI_API_KEY\` is correctly set
   - Verify the key is valid in Google AI Studio
   - Check for extra spaces or quotes in .env.local

2. **Build Errors**:
   - Clear node_modules and reinstall: \`rm -rf node_modules && npm install\`
   - Update Node.js to version 18.17.0 or higher
   - Check for TypeScript errors: \`npm run lint\`

3. **Export Issues**:
   - Ensure all dependencies are installed
   - Check browser console for JavaScript errors
   - Verify API routes are working: visit \`/api/generate-sop\`

4. **Deployment Issues**:
   - Confirm all environment variables are set
   - Check build logs for specific errors
   - Ensure Node.js version is compatible

### Performance Tips

- Use production build for deployment: \`npm run build && npm start\`
- Optimize images and assets for faster loading
- Monitor API response times and quota usage
- Consider caching for frequently accessed data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:
- Check the troubleshooting section above
- Review the GitHub issues
- Contact the development team

---

**Built with ❤️ using Next.js, Tailwind CSS, and Google Gemini AI**

