# Modern URL Shortener

A beautiful URL shortener with a glassmorphism UI and dark theme, built with Node.js, Express, and MongoDB.

## Live Demo
The application is live at: [https://url-shortener-3fm9.onrender.com/](https://url-shortener-3fm9.onrender.com/)

## Features

- Modern glassmorphism UI design
- Dark theme
- Responsive layout
- URL click tracking
- One-click copy
- Real-time URL list updates
- Smooth animations and transitions

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/AJ0070/url-shortener.git
cd url-shortener
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
```

4. Start MongoDB service on your machine

5. Run the application:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Usage

1. Enter a long URL in the input field
2. Click "Shorten" to generate a short URL
3. Copy the shortened URL with one click
4. View statistics and history in the list below

## Development

- `npm run dev` - Start the development server with hot reload
- `npm start` - Start the production server

## Technologies Used

- Node.js
- Express
- MongoDB
- Mongoose
- shortid
- HTML5
- CSS3 (with modern features)
- Vanilla JavaScript

## Deployment

The application is deployed on [Render](https://render.com) with MongoDB Atlas as the database service.

## License

MIT 
