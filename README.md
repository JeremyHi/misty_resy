# Misty: Your Personal AI Reservations Assistant

Misty is a web application that automates the process of making restaurant reservations through Resy. It helps users secure hard-to-get reservations by automatically attempting to book their desired time slots.

## Features

- Secure authentication with Supabase
- Automated Resy credential management with encryption
- Real-time reservation tracking dashboard
- Multiple time slot preferences for reservations
- Automated booking attempts for desired reservation times
- Booking status monitoring and notifications

## Tech Stack

- **Frontend**: Next.js 15.1.3, React 19
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **API Integration**: Resy API
- **Type Safety**: TypeScript

## Prerequisites

- Node.js >= 18.17.0
- npm or yarn
- Supabase account
- Resy API credentials

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_RESY_API_KEY=your_resy_api_key
REACT_APP_ENCRYPTION_KEY=your_encryption_key
```

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/misty_resy.git
cd misty_resy
```

2. Install dependencies:
```bash
npm install
```

3. Initialize the database:
```bash
npx supabase init
```

4. Run database migrations:
```sql
npx supabase db push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

- `/src/app` - Next.js 13+ app router pages and API routes
- `/src/components` - React components
- `/src/lib` - Utility functions and service configurations
- `/src/utils` - Helper functions
- `/supabase` - Database schema and migrations

## Database Schema

The application uses three main tables:

- `resy_credentials` - Stores encrypted Resy login information
- `restaurants` - Restaurant information and Resy venue IDs
- `reservation_requests` - Tracks reservation attempts and status

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add new feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
