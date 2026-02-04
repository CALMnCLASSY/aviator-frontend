# Aviator Signals Frontend

A comprehensive frontend application for Aviator game signal predictions with integrated chat support, payment processing, and bot functionality.

## 🚀 Features

### Core Functionality
- **Real-time Aviator Predictions**: Advanced signal generation for Aviator game predictions
- **Multiple Betting Sites**: Support for various betting platforms
- **Package Management**: Different prediction packages (2x, 5x, 10x, 20x, 30x, 50x, 70x, 100x)
- **Payment Integration**: Secure payment processing with PayPal and PesaPal

### Chat & Support System
- **Real-time Customer Support**: Live chat integration with admin reply system
- **Telegram Integration**: Admin replies via Telegram webhooks
- **Session Management**: Persistent chat sessions across page reloads
- **Notification System**: Real-time notifications for new admin replies
- **Multi-platform Support**: Chat available on both main and bot pages

### Bot Integration
- **Automated Bot Functionality**: Intelligent bot system for Aviator predictions
- **Site Selection**: Support for multiple betting platforms
- **Real-time Status Updates**: Live bot status and prediction tracking
- **Game Modal Integration**: In-app game interface

## 🏗️ Architecture

### File Structure
```
Avsite 3.0/
├── index.html          # Landing page
├── main.html          # Main application with full features
├── bot.html           # Bot-specific functionality
├── styles.css         # Global styles and responsive design
├── AvSiteImg/         # Image assets and proof screenshots
├── .well-known/       # Security and verification files
├── ads.txt            # Advertising verification
├── robots.txt         # SEO crawling directives
├── sitemap.xml        # SEO sitemap
└── README.md          # Documentation
```

### Key Components

#### Chat System
- **Session Management**: Unique session IDs with user identification
- **Admin Reply Polling**: 3-second intervals for real-time responses
- **Cross-platform Compatibility**: Works on both main.html and bot.html
- **CORS-compliant**: Proper cross-origin resource sharing

#### Payment System
- **PayPal Integration**: Secure payment processing
- **PesaPal Support**: African payment gateway integration
- **Package Verification**: Automated payment verification system
- **Currency Conversion**: USD to KES conversion support

#### Bot System
- **Multi-site Support**: Compatible with various betting platforms
- **Real-time Predictions**: Live signal generation
- **Status Tracking**: Comprehensive bot status monitoring
- **Game Integration**: Built-in game interface

## 🔧 Configuration

### Backend Integration
This frontend connects to the Aviator Backend API:
- **Base URL**: `https://aviator-backend-komp.onrender.com`
- **Chat API**: Real-time messaging and admin replies
- **Payment API**: Secure transaction processing
- **Telegram Integration**: Admin notification system

### Environment Setup
1. Ensure the backend is running and accessible
2. Configure proper CORS settings for your domain
3. Set up Telegram webhook for admin notifications
4. Configure payment gateway credentials

## 🚀 Deployment

### Production Deployment
- **Current Host**: avisignals.com
- **Backend**: Separate deployment on Render
- **CDN**: Optimized for global content delivery
- **Security**: HTTPS enabled with proper headers

### Local Development
1. Serve files using a local web server
2. Update API_BASE_URL for local backend
3. Ensure CORS is configured for localhost
4. Test all payment and chat functionality

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Tablet Support**: Enhanced tablet experience
- **Desktop**: Full-featured desktop interface
- **Cross-browser**: Compatible with all modern browsers

## 🔒 Security Features

- **Content Security Policy**: XSS protection
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Client-side validation for all forms
- **Secure Communications**: HTTPS-only API calls

## 🎯 Key Features Implementation

### Payment Integration
- PayPal SDK integration
- PesaPal API integration
- Automatic payment verification
- Package activation system

### Bot Functionality
- Site selection interface
- Real-time prediction generation
- Status monitoring
- Game modal integration

## 🔄 Updates & Maintenance

### Recent Updates
- CORS issues resolved for chat system
- Enhanced admin reply polling
- Improved payment verification
- Mobile responsiveness optimizations
- WhatsApp popup integration

### Maintenance Notes
- Regular security updates
- Performance optimizations
- Cross-browser compatibility testing
- Mobile experience enhancements

## 📞 Support

For technical support or inquiries:
- **WhatsApp**: +254788020107
- **Email**: Support available through integrated chat system
- **Telegram**: Admin replies via integrated system

## 🏷️ Version

**Current Version**: 3.0
**Last Updated**: August 2025
**Status**: Production Ready

---

Built with ❤️ for the Aviator gaming community
