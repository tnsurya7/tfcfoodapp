# TFC Food Ordering App 🍽️

A modern, full-stack food ordering application built with Next.js, Firebase, and TypeScript. Features real-time order tracking, email OTP authentication, admin dashboard, and premium UI/UX.

![TFC Food Ordering](https://img.shields.io/badge/TFC-Food%20Ordering-red?style=for-the-badge&logo=react)
![Next.js](https://img.shields.io/badge/Next.js-15.1.5-black?style=flat-square&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-orange?style=flat-square&logo=firebase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

## 🚀 Live Demo

- **Production**: [https://tfcfoodapp.vercel.app](https://tfcfoodapp.vercel.app)
- **Admin Panel**: [https://tfcfoodapp.vercel.app/admin](https://tfcfoodapp.vercel.app/admin)

## ✨ Features

### 🛍️ Customer Features
- **Email OTP Authentication** - Secure login with EmailJS integration
- **Real-time Order Tracking** - Track orders from placement to delivery
- **Interactive Menu** - Browse food items by categories
- **Shopping Cart** - Add/remove items with quantity management
- **Order History** - View past orders and their status
- **Profile Management** - User profile with order statistics
- **Responsive Design** - Works perfectly on mobile and desktop
- **PWA Support** - Install as mobile app

### 👨‍💼 Admin Features
- **Admin Dashboard** - Comprehensive order and food management
- **CRUD Operations** - Add, edit, delete food items
- **Order Management** - Update order status in real-time
- **Customer Management** - View customer details and statistics
- **PDF Reports** - Generate and download order reports
- **Real-time Updates** - Live order notifications
- **Analytics** - Revenue and order statistics

### 🔧 Technical Features
- **Real-time Database** - Firebase Realtime Database
- **Premium Toast Notifications** - Custom toast system with animations
- **Order Status Tracking** - Visual progress indicators
- **Image Optimization** - Next.js Image component with WebP support
- **SEO Optimized** - Meta tags and structured data
- **Performance Optimized** - Code splitting and lazy loading

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Firebase Realtime Database
- **Authentication**: Custom Email OTP with EmailJS
- **State Management**: Zustand
- **Icons**: Lucide React
- **PDF Generation**: jsPDF with AutoTable
- **Deployment**: Vercel
- **PWA**: next-pwa

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 8+
- Firebase project
- EmailJS account

### 1. Clone Repository
```bash
git clone https://github.com/tnsurya7/tfcfoodapp.git
cd tfcfoodapp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local
```

### 4. Firebase Setup
1. Create a Firebase project
2. Enable Realtime Database
3. Copy configuration to `.env.local`
4. See `FIREBASE_SETUP_GUIDE.md` for detailed instructions

### 5. EmailJS Setup
1. Create EmailJS account
2. Set up email service and template
3. Add credentials to `.env.local`

### 6. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
tfcfoodapp/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Order checkout
│   │   ├── login/             # Authentication
│   │   ├── menu/              # Food menu
│   │   └── profile/           # User profile & orders
│   ├── components/            # Reusable components
│   │   ├── admin/             # Admin components
│   │   ├── auth/              # Authentication components
│   │   ├── food/              # Food-related components
│   │   ├── home/              # Homepage components
│   │   ├── layout/            # Layout components
│   │   └── orders/            # Order tracking components
│   ├── contexts/              # React contexts
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Utility libraries
│   └── store/                 # Zustand stores
├── public/                    # Static assets
├── docs/                      # Documentation
└── config files
```

## 🔧 Configuration

### Environment Variables
See `.env.example` for all required environment variables:

- **Firebase**: Database configuration
- **EmailJS**: Email service for OTP
- **Admin**: Admin panel credentials
- **Optional**: Payment gateway, notifications

### Firebase Database Structure
```json
{
  "tfc": {
    "users": { "user_id": { "name", "email", "phone" } },
    "foods": { "food_id": { "name", "price", "category", "image" } },
    "orders": { "order_id": { "customer", "items", "status", "total" } },
    "carts": { "user_id": { "item_id": { "name", "price", "qty" } } },
    "admins": { "username": { "password", "createdAt" } }
  }
}
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

See `DEPLOYMENT.md` for detailed deployment instructions.

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📱 Features Walkthrough

### Customer Journey
1. **Browse Menu** → View food items by category
2. **Add to Cart** → Select items and quantities
3. **Login/Register** → Email OTP authentication
4. **Checkout** → Enter delivery details and place order
5. **Track Order** → Real-time status updates
6. **Order History** → View past orders in profile

### Admin Workflow
1. **Login** → Admin credentials
2. **Manage Foods** → Add/edit/delete menu items
3. **Process Orders** → Update order status
4. **View Analytics** → Revenue and customer stats
5. **Generate Reports** → PDF order reports

## 🎨 UI/UX Features

- **Modern Design** - Clean, professional interface
- **Smooth Animations** - Framer Motion transitions
- **Premium Toasts** - Custom notification system
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - User-friendly error messages
- **Mobile First** - Responsive design approach

## 🔒 Security Features

- **Environment Variables** - No hardcoded credentials
- **Input Validation** - Form validation and sanitization
- **Protected Routes** - Authentication-based access control
- **Firebase Security Rules** - Database access control
- **HTTPS Only** - Secure communication

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Core Web Vitals**: Optimized for speed and user experience
- **Bundle Size**: Optimized with code splitting
- **Image Optimization**: WebP format with lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**SURYA KUMAR**
- GitHub: [@tnsurya7](https://github.com/tnsurya7)
- Email: suryakumar56394@gmail.com

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for real-time database
- Tailwind CSS for styling system
- Lucide React for beautiful icons
- EmailJS for email services

## 📞 Support

For support and questions:
- Create an [Issue](https://github.com/tnsurya7/tfcfoodapp/issues)
- Email: suryakumar56394@gmail.com
- Phone: +91 6379151006

---

**Developed by SURYA KUMAR** 🍕🍔🍜