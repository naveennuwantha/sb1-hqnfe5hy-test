# SkillHub Mobile App

A React Native/Expo mobile application for skill sharing and networking through QR codes and NFC technology.

## Features

- User authentication with email verification
- QR code generation for profile sharing
- NFC support for contact exchange
- AI chatbot integration
- Learning resources with PDF viewer
- Social networking features

## Project Structure

```
src/
├── assets/                  # Images, icons, fonts
├── components/             # Reusable UI components
├── screens/                # Main app screens
├── navigation/             # Navigation setup
├── services/               # Supabase integration
└── utils/                  # Helper functions
```

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Supabase account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd skillhub-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure Supabase:
   - Create a new Supabase project
   - Copy your project URL and anon key
   - Update `src/services/supabaseClient.js` with your credentials

4. Start the development server:
```bash
npm start
# or
yarn start
```

5. Run on your device:
   - Install the Expo Go app on your device
   - Scan the QR code from the terminal
   - Or run on an emulator using the Expo CLI commands

## Database Schema

### Users Table
- id (UUID, primary key)
- email (text, unique)
- password (text)
- name (text)
- phone (text)
- profile_url (text)
- qr_code (text)
- is_verified (boolean)

### Posts Table
- id (UUID)
- user_id (UUID → users.id)
- images (text array)
- description (text)
- likes (integer)

### Tutorials Table
- id (UUID)
- title (text)
- pdf_url (text)
- admin_id (UUID → users.id)

### Contacts Table
- user_id (UUID → users.id)
- saved_user_id (UUID → users.id)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Support

For support, email support@nfc.lk or call +94764479187.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 