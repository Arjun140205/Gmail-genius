# 📧 GmailGenius - AI-Powered Email Management

A comprehensive email management application that transforms your Gmail experience with AI-powered job matching, resume analysis, and intelligent email processing.

## 🌟 Features

### 📱 Enhanced Email Management
- **Full Gmail Integration**: Access all your emails with advanced search and filtering
- **Pagination Support**: Navigate through large email collections efficiently
- **Grid & List Views**: Choose between visual card layout or compact list view
- **Advanced Search**: Gmail search syntax with quick filters and suggestions
- **Real-time Updates**: Live email synchronization with Gmail

### 🤖 AI-Powered Analysis
- **Resume Parsing**: Extract skills, experience, and qualifications from PDF/DOC resumes
- **Job Matching**: Intelligent matching between resume and job emails with percentage scores
- **Skill Analysis**: Identify required vs. possessed skills with gap analysis
- **Email Classification**: Automatic job/internship/offer detection and tagging
- **Sentiment Analysis**: Understand email tone and urgency levels

### 📊 Comprehensive Analytics
- **Match Dashboard**: Visual representation of job compatibility scores
- **Skill Trends**: Track in-demand skills and industry trends
- **Email Insights**: Analytics on email patterns and job opportunities
- **Progress Tracking**: Monitor application status and response rates

### 🎯 Smart Recommendations
- **Personalized Suggestions**: AI-driven career recommendations
- **Cover Letter Generation**: Automated cover letter creation for job applications
- **Interview Preparation**: Generated questions and tips based on job requirements
- **Resume Improvement**: Suggestions for enhancing resume based on job market trends

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Gmail account with API access
- OpenRouter API key for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GmailGenius
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   Create `.env` files in both server and client directories:

   **Server (.env)**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/gmailgenius
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   OPENROUTER_API_KEY=your_openrouter_api_key
   SESSION_SECRET=your_session_secret
   CLIENT_URL=http://localhost:3000
   ```

   **Client (.env)**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
   ```

4. **Database Setup**
   ```bash
   # Start MongoDB
   mongod
   ```

5. **Start the Application**
   ```bash
   # Start server (from server directory)
   npm start
   
   # Start client (from client directory)
   npm start
   ```

## 📖 Usage Guide

### 1. Authentication
- Click "Sign in with Google" to authenticate
- Grant Gmail read permissions
- Your profile will be loaded automatically

### 2. Resume Upload
- Upload your resume (PDF, DOC, DOCX, or TXT)
- AI will parse and extract key information
- Skills and experience will be identified

### 3. Email Management
- **Search & Filter**: Use the search bar with Gmail syntax
- **Quick Filters**: Apply date, importance, and read status filters
- **View Modes**: Switch between grid and list views
- **Pagination**: Navigate through email pages

### 4. Job Analysis
- Click on any email to view detailed analysis
- See matching percentage with your resume
- Review required vs. possessed skills
- Get personalized recommendations

### 5. Dashboard Features
- **Analytics Panel**: View email statistics and trends
- **Suggestion Panel**: Get AI-powered career advice
- **Suggested Matches**: See top job opportunities
- **Export Options**: Download analysis results

## 🔧 API Documentation

### Gmail Routes (`/api/gmail`)
- `GET /emails` - Fetch paginated emails with filters
- `GET /email/:id` - Get detailed email information
- `GET /search` - Advanced email search
- `GET /labels` - Get Gmail labels
- `GET /analytics` - Email analytics data

### AI Routes (`/api/ai`)
- `POST /parse-resume` - Parse resume file
- `POST /analyze-job-match` - Analyze job-resume compatibility
- `POST /extract-job-requirements` - Extract job details from email
- `POST /batch-analyze` - Batch process multiple emails
- `POST /generate-cover-letter` - Generate personalized cover letters

### Authentication Routes (`/auth`)
- `GET /google` - Initiate Google OAuth
- `GET /google/callback` - Handle OAuth callback
- `GET /user` - Get current user info
- `GET /logout` - Logout user

## 🏗️ Architecture

### Frontend Components
```
src/
├── components/
│   ├── EnhancedDashboard.jsx      # Main dashboard with full features
│   ├── EmailDetailModal.jsx       # Detailed email view with AI analysis
│   ├── EmailSearch.jsx           # Advanced search and filtering
│   ├── Pagination.jsx            # Email pagination controls
│   ├── AnalyticsPanel.jsx        # Email and job analytics
│   ├── SuggestedMatches.jsx      # AI-powered job recommendations
│   └── ResumeUpload.jsx          # Resume parsing and upload
├── services/
│   ├── gmailApiService.js        # Gmail API integration
│   └── aiApiService.js           # AI service integration
└── pages/
    └── Email.jsx                 # Email display and management
```

### Backend Structure
```
server/
├── controllers/
│   ├── suggestion.controller.js  # AI suggestions logic
│   └── user.controller.js        # User management
├── services/
│   └── aiService.js              # OpenRouter AI integration
├── routes/
│   ├── gmailRoutes.js           # Gmail API endpoints
│   ├── authRoutes.js            # Authentication endpoints
│   └── suggestionRoutes.js      # AI suggestion endpoints
└── config/
    ├── googleAuth.js            # Google OAuth configuration
    └── passportConfig.js        # Passport.js setup
```

## 🎨 UI Features

### Enhanced Dashboard
- **Modern Design**: Clean, responsive interface with smooth animations
- **Dark/Light Mode**: Automatic theme detection and manual toggle
- **Mobile Responsive**: Optimized for all device sizes
- **Performance Optimized**: Lazy loading and efficient rendering

### Email Detail Modal
- **Tabbed Interface**: Separate tabs for email details, content, and AI analysis
- **Visual Match Indicators**: Color-coded skill matching with progress bars
- **Interactive Elements**: Expandable sections and dynamic content
- **Export Options**: Save analysis results in multiple formats

### Advanced Search
- **Gmail Syntax Support**: Full Gmail search operator compatibility
- **Quick Filters**: One-click filtering for common scenarios
- **Search Suggestions**: AI-powered search recommendations
- **Filter Persistence**: Remember search preferences across sessions

## 🔐 Security Features

- **OAuth 2.0**: Secure Google authentication
- **Token Management**: Automatic token refresh and validation
- **Data Privacy**: Local processing with optional cloud AI
- **Rate Limiting**: API request throttling for stability
- **Input Validation**: Comprehensive input sanitization

## 🚀 Performance Optimizations

- **Lazy Loading**: Components loaded on demand
- **Memoization**: React.memo and useMemo for expensive operations
- **Pagination**: Efficient email loading with virtual scrolling
- **Caching**: Smart caching of AI analysis results
- **Bundle Splitting**: Optimized JavaScript bundles

## 🧪 Testing

```bash
# Run frontend tests
cd client && npm test

# Run backend tests
cd server && npm test

# Run integration tests
npm run test:integration
```

## 📦 Deployment

### Production Build
```bash
# Build client
cd client && npm run build

# Start production server
cd server && npm run start:prod
```

### Environment Variables (Production)
- Update API URLs to production endpoints
- Configure MongoDB connection string
- Set up SSL certificates for HTTPS
- Configure Google OAuth for production domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions for feature requests
- **Email**: Contact support@gmailgenius.com for enterprise support

## 🙏 Acknowledgments

- **OpenRouter API**: For providing access to multiple AI models
- **Google Gmail API**: For email integration capabilities
- **React Community**: For excellent component libraries
- **MongoDB**: For flexible data storage solutions

---

**Made with ❤️ for job seekers and professionals looking to optimize their email workflow**
