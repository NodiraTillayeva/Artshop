# Artshop - Digital Art Portfolio & Shop

A modern, responsive digital art portfolio website with an integrated contact-based shop, built with React, Tailwind CSS, and Express.

## Features

- **Portfolio Gallery**: Display digital artworks with category filtering
- **Artwork Details**: Individual pages for each artwork with full information
- **Contact System**: Inquiry form for artwork purchases with email notifications
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern Stack**: React + Vite for fast development, Express backend for API

## Tech Stack

### Frontend
- **React 18.3+** - UI library
- **Vite 5+** - Build tool and dev server
- **Tailwind CSS 3.4+** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Toast notifications
- **Framer Motion** - Animations

### Backend
- **Node.js** - Runtime environment
- **Express 4+** - Web framework
- **Nodemailer** - Email sending
- **Express Validator** - Input validation
- **Express Rate Limit** - Rate limiting
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## Project Structure

```
Artshop/
├── frontend/               # React frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── assets/        # Images and media
│   │   ├── components/    # React components
│   │   │   ├── common/    # Reusable components
│   │   │   ├── layout/    # Layout components
│   │   │   ├── gallery/   # Gallery components
│   │   │   ├── artwork/   # Artwork components
│   │   │   └── contact/   # Contact form components
│   │   ├── pages/         # Page components
│   │   ├── data/          # Static data (artworks, categories)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── index.html         # HTML template
│   ├── package.json       # Frontend dependencies
│   ├── vite.config.js     # Vite configuration
│   └── tailwind.config.js # Tailwind configuration
│
├── backend/               # Express backend API
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic (email, etc.)
│   │   └── utils/         # Utility functions
│   ├── server.js          # Server entry point
│   ├── package.json       # Backend dependencies
│   └── .env.example       # Environment variables template
│
├── docs/                  # Documentation
├── package.json           # Root package.json
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Running the Application

#### Development Mode

Run both frontend and backend together:
```bash
npm run dev
```

Or run separately:
```bash
# Frontend (from root)
npm run dev:frontend

# Backend (from root)
npm run dev:backend
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

#### Production Build

```bash
npm run build
```

## Adding Your Own Artwork

Edit the artwork data in `frontend/src/data/artworks.json`:

```json
{
  "id": "unique-id",
  "title": "Artwork Title",
  "description": "Description of the artwork",
  "price": 350,
  "category": "digital-painting",
  "medium": "Digital",
  "dimensions": "3000x4000px",
  "year": 2024,
  "images": {
    "thumbnail": "/path/to/thumbnail.jpg",
    "full": "/path/to/full-image.jpg"
  },
  "available": true,
  "featured": true
}
```

**Adding Images:**
1. Place your images in `frontend/src/assets/artwork/`
2. Create thumbnails (400-500px) in `thumbnail/` folder
3. Place full-size images in `full/` folder
4. Update the `images` paths in artworks.json

## Email Configuration

The contact form uses Nodemailer to send emails. To enable email functionality:

### Using Gmail

1. Create a Gmail App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password

2. Update `backend/.env`:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-digit-app-password
   EMAIL_TO=where-to-receive-messages@example.com
   ```

### Using Other Email Services

Update the `EMAIL_SERVICE` in `.env` or configure a custom SMTP:
```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email
EMAIL_PASSWORD=your-password
```

## Customization

### Theme Colors

Edit `frontend/tailwind.config.js` to change the color scheme:
```javascript
colors: {
  primary: {
    500: '#0ea5e9',  // Main brand color
    600: '#0284c7',
  },
  accent: {
    500: '#f59e0b',  // Accent color
  },
}
```

### Categories

Edit `frontend/src/data/categories.json` to add/modify artwork categories.

### Artist Information

Edit the About page in `frontend/src/pages/About.jsx` to update your bio and information.

## API Endpoints

### POST /api/contact
Submit a contact form

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string",
  "artworkId": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Rate Limiting:** 5 requests per 15 minutes per IP

## Development Tips

### Hot Reload
Both frontend and backend support hot reload during development. Changes to files will automatically refresh the application.

### Adding New Pages
1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Add navigation link in `frontend/src/components/layout/Navigation.jsx`

### Styling
- Use Tailwind utility classes for styling
- Custom CSS can be added in `frontend/src/index.css`
- Component-specific styles should use Tailwind

## Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `frontend/dist` folder
3. Set environment variable: `VITE_API_URL=https://your-backend-api.com/api`

### Backend (Railway/Heroku/DigitalOcean)
1. Deploy the `backend/` folder
2. Set all environment variables from `.env.example`
3. Ensure `NODE_ENV=production`

## Troubleshooting

### Port Already in Use
If port 3000 or 5000 is already in use:
- Change frontend port in `frontend/vite.config.js`
- Change backend port in `backend/.env`

### Email Not Sending
- Check email credentials in `backend/.env`
- For Gmail, ensure you're using an App Password
- Check console logs for error messages
- During development, emails are logged to console if not configured

### Build Errors
```bash
# Clear node_modules and reinstall
npm run clean
npm run install:all
```

## Contributing

This is a personal portfolio project, but suggestions and improvements are welcome!

## License

MIT License - feel free to use this project as a template for your own portfolio.

## Support

For questions or issues, please create an issue in the repository or contact through the website's contact form.

---

Built with ❤️ using React, Tailwind CSS, and Express
