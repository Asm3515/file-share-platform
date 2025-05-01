


# File Sharing Platform

A secure, modern file sharing platform built with Next.js, MongoDB, and Vercel Blob. This platform allows users to upload, share, and manage files with granular access controls and robust security features.



## Features

- **Secure Authentication**: User registration and login with NextAuth.js
- **File Management**: Upload, download, preview, and delete files
- **Access Control**: Set files as private, gated (registered users), or public
- **File Sharing**: Share files with specific users with custom permissions
- **File Preview**: Preview supported file types directly in the browser
- **Drag-and-Drop Uploads**: Easy file uploading with progress tracking
- **Search Functionality**: Find files quickly with search
- **Admin Dashboard**: Manage users and view activity logs
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Authentication**: NextAuth.js
- **Database**: MongoDB
- **File Storage**: Vercel Blob
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.x or later
- MongoDB database
- Vercel account (for Blob storage)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/asm3515/file-sharing-platform.git
   cd file-sharing-platform
   ```

2. Install dependencies:

```shellscript
npm install
```


3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:

```plaintext
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```


4. Run the development server:

```shellscript
npm run dev
```


5. Open [http://localhost:3000](http://localhost:3000) in your browser.


## Environment Variables

| Variable | Description
|-----|-----
| `MONGODB_URI` | MongoDB connection string
| `NEXTAUTH_URL` | URL of your application ([http://localhost:3000](http://localhost:3000) for development)
| `NEXTAUTH_SECRET` | Secret for NextAuth.js (generate with `openssl rand -base64 32`)
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for file storage


## Usage

### User Registration and Login

1. Navigate to the registration page and create an account
2. Log in with your credentials
3. Access your dashboard to manage files


### File Management

- **Upload Files**: Click the "Upload" button in the sidebar
- **View Files**: Navigate to "My Files" to see your uploaded files
- **Preview Files**: Click on a file to preview it
- **Download Files**: Use the dropdown menu on a file card to download
- **Delete Files**: Use the dropdown menu on a file card to delete


### File Sharing

1. Click the "Share" button on a file
2. Enter the email of the user you want to share with
3. Set the appropriate permissions
4. Click "Share"


### Access Control

1. Click "Change access" on a file
2. Select one of the following access levels:

1. **Private**: Only you can access
2. **Gated**: All registered users can access
3. **Public**: Anyone with the link can access





## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication


### Files

- `GET /api/files` - Get all files owned by the current user
- `POST /api/files/upload` - Upload a new file
- `GET /api/files/shared` - Get files shared with the current user
- `GET /api/files/public` - Get all public files
- `DELETE /api/files/:id` - Delete a file
- `PUT /api/files/:id/access` - Update file access level
- `POST /api/files/:id/share` - Share a file with another user
- `DELETE /api/files/:id/share/:userId` - Remove file sharing for a user
- `GET /api/files/:id/download` - Get download URL for a file


### Admin

- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/logs` - Get all activity logs (admin only)
- `PUT /api/admin/users/:id/role` - Update user role (admin only)
- `DELETE /api/admin/users/:id` - Delete a user (admin only)


## Security Features

- **Authentication**: Secure user authentication with NextAuth.js
- **Authorization**: Role-based access control (user/admin)
- **Data Protection**: Secure file storage with Vercel Blob
- **Access Logging**: All file access is logged for audit purposes
- **Granular Permissions**: Control who can access your files and what they can do


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Made with ❤️ by Ajinkya
- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)


```plaintext


```

![Porject_Image](https://github.com/user-attachments/assets/aede6ac8-abea-4c3b-a58b-6d11bf956387)

![image](https://github.com/user-attachments/assets/2543c20b-1e5e-4cac-92d9-3ac8d53fe1e7)

![image](https://github.com/user-attachments/assets/a40c127e-c7e6-46f2-bff7-80eb52962114)

![image](https://github.com/user-attachments/assets/1eb8bcb7-14ba-483d-8f33-13dbf6c37731)




