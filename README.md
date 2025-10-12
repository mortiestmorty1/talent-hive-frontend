# TalentHive Frontend

A modern, responsive frontend application for TalentHive - a freelance marketplace platform built with Next.js and Tailwind CSS.

## 🚀 Features

- **User Authentication**: Secure login/signup with JWT tokens
- **Dashboard**: Comprehensive user dashboard for buyers and sellers
- **Gig Management**: Create, edit, and manage freelance gigs
- **Job Posting**: Post and manage job opportunities
- **Order Management**: Track orders and payments with status indicators
- **Payment Integration**: Secure payments with Stripe
- **Real-time Messaging**: Built-in messaging system with instant notifications
- **Review System**: Verified purchase reviews for completed orders
- **Dispute Resolution**: Built-in dispute handling and mediation system
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **File Upload**: Support for portfolio and project files
- **Role-Based Access**: Separate workflows for buyers and sellers

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2.10
- **Styling**: Tailwind CSS 3.3.2
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Payment**: Stripe
- **Icons**: React Icons
- **Animations**: Framer Motion
- **Notifications**: React Toastify

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js (v16 or higher)
- npm or yarn
- The TalentHive backend running (see [Backend Repository](https://github.com/mortiestmorty1/talent-hive-backend.git))

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mortiestmorty1/talent-hive-frontend.git
   cd talent-hive-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   
   Create a `.env.local` file in the root directory with the following variables:
   
   ```env
   # Backend Server URL
   NEXT_PUBLIC_SERVER_URL=http://localhost:4003
   
   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key_here
   ```
   
   **Required Environment Variables:**
   - `NEXT_PUBLIC_SERVER_URL`: The URL of your TalentHive backend server
   - `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`: Your Stripe publishable key for payment processing

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context for state management
├── pages/              # Next.js pages and routing
│   ├── buyer/          # Buyer-specific pages
│   ├── seller/         # Seller-specific pages
│   ├── jobs/           # Job-related pages
│   ├── orders/         # Order management pages
│   └── disputes/       # Dispute resolution pages
├── styles/             # Global styles
└── utils/              # Utility functions and constants
```

## 🚀 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔗 Backend Integration

This frontend application requires the TalentHive backend to be running. Make sure to:

1. Set up the backend server (see [Backend Repository](https://github.com/mortiestmorty1/talent-hive-backend.git))
2. Configure the `NEXT_PUBLIC_SERVER_URL` environment variable to point to your backend
3. Ensure CORS is properly configured on the backend

## 💳 Payment Setup

To enable payment functionality:

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your publishable key from the Stripe dashboard
3. Add it to your `.env.local` file as `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`
4. Configure the corresponding secret key in your backend

## 🎨 Styling

The application uses Tailwind CSS for styling. Key design features:

- Responsive design for all screen sizes
- Dark/light theme support
- Custom component library
- Smooth animations with Framer Motion

## 📱 Features Overview

### For Buyers
- Browse and search gigs
- Post job requirements
- Manage orders and payments
- Real-time order status tracking
- Communicate with sellers via instant messaging
- Leave verified reviews and ratings after order completion
- Access dispute resolution if needed

### For Sellers
- Create and manage gigs
- Apply for jobs with proposals
- Manage portfolio and certifications
- Track earnings and analytics
- Handle customer communications with real-time chat
- Request order completion approval
- **Note**: Sellers cannot purchase gigs (must switch to buyer mode)

## 🔒 Security

- JWT-based authentication
- Secure API communication
- Input validation and sanitization
- Protected routes and middleware

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Heroku

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Backend Repository](https://github.com/mortiestmorty1/talent-hive-backend.git) for backend-related issues
2. Create an issue in this repository
3. Contact the development team

## 📝 Recent Updates

### Latest Features (v1.0.1)

1. **Real-time Message Notifications** 🔔
   - Toast notifications appear when you receive new messages
   - Works for both gig orders and job messages
   - Auto-dismiss after 5 seconds with sender information

2. **Enhanced Order Review System** ⭐
   - Buyers can now leave reviews after order completion
   - "Leave Review" button appears in orders page for completed orders
   - Reviews are automatically marked as verified purchases
   - Visual status badges show order progress

3. **Seller Purchase Prevention** 🚫
   - Sellers cannot purchase gigs (prevents confusion)
   - Clear visual feedback with disabled buttons
   - Toast notifications guide users to switch modes
   - Checkout page protection prevents workarounds

### How These Features Work

**Message Notifications:**
- Automatically appear when someone sends you a message
- Click to dismiss or wait for auto-dismiss
- Shows sender's name for context

**Review System:**
- Order must be completed (status = COMPLETED)
- Star icon appears in orders table for buyers
- Click to navigate to gig page with review form
- Submit detailed ratings and comments

**Role-Based Purchasing:**
- Sellers see disabled "Switch to Buyer Mode" button on gigs
- Warning message explains the restriction
- Easy role toggle in navigation bar

## 🔗 Related Repositories

- [TalentHive Backend](https://github.com/mortiestmorty1/talent-hive-backend.git) - The backend API server

---

**Note**: Make sure to keep your environment variables secure and never commit them to version control. The `.env.local` file is already included in `.gitignore` to prevent accidental commits.