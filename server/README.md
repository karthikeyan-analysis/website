# Karthikeyan Analysis - Backend Server

Node.js + Express backend for handling email, categories, orders, and contacts.

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the following in `.env`:

#### Firebase Admin SDK

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate New Private Key"
3. Copy the JSON file contents:
   - `FIREBASE_PROJECT_ID`: your project ID
   - `FIREBASE_PRIVATE_KEY`: the private key (with escaped newlines)
   - `FIREBASE_CLIENT_EMAIL`: the service account email

#### Gmail Configuration (Nodemailer)

1. Enable 2-Step Verification on your Google Account
2. Generate App Password:
   - Go to myaccount.google.com
   - Security > App passwords
   - Select "Mail" and "Windows Computer" (or your device)
   - Copy the generated 16-character password
3. Set:
   - `EMAIL_USER`: your Gmail address
   - `EMAIL_PASSWORD`: the 16-character app password
   - `EMAIL_FROM`: your Gmail address
   - `ADMIN_EMAIL`: where to send admin notifications

#### Other Configuration

- `FRONTEND_URL`: Your frontend URL (default: http://localhost:5173)
- `PORT`: Server port (default: 5000)

### 3. Start the Server

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm start
```

## API Endpoints

### Categories

- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Contacts

- `POST /api/contacts/submit` - Submit contact form
- `GET /api/contacts` - Get all contacts (admin)
- `PATCH /api/contacts/:id/read` - Mark contact as read
- `DELETE /api/contacts/:id` - Delete contact

### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `PATCH /api/orders/:id/status` - Update order status
- `DELETE /api/orders/:id` - Delete order

## Email Functionality

The backend automatically sends:

- Contact form confirmation emails
- Order confirmation emails
- Order shipped notifications
- Order delivery confirmations
- Admin notifications for new contacts

All emails are HTML-formatted with branding.
