# CDN Collection Generator

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Lucide React](https://img.shields.io/badge/Lucide-React-222222?style=for-the-badge&logo=lucide&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

This is a Next.js application that allows users to search for and generate CDN links for popular CSS and JavaScript libraries. The application uses the cdnjs API to search for libraries and provides a list of famous libraries for quick access.

## Features

- Search for CSS and JavaScript libraries using the cdnjs API.
- A curated list of famous libraries for quick access.
- Select multiple libraries and generate CDN tags for them.
- Copy the generated tags to the clipboard.
- Dark mode support.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework for building server-side rendered and static web applications.
- [React](https://reactjs.org/) - A JavaScript library for building user interfaces.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for rapid UI development.
- [Lucide React](https://lucide.dev/) - A collection of simply designed icons for React.
- [Geist](https://vercel.com/font) - A typeface for developers.

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/VishalRaut2106/CDN-collector.git
```

2. Navigate to the project directory:

```bash
cd CDN-collector
```

3. Install the dependencies:

```bash
npm install
```

### Running the Application

To run the application in development mode, use the following command:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Available Scripts

- `npm run dev`: Runs the application in development mode.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Lints the code using ESLint.

## Project Structure

```
.
├── app
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx
├── components
│   └── ui
│       ├── button.jsx
│       ├── card.jsx
│       ├── checkbox.jsx
│       ├── input.jsx
│       └── textarea.jsx
├── lib
│   └── famous-libraries.js
├── public
├── .gitignore
├── jsconfig.json
├── LICENSE
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
└── tailwind.config.js
```

- **`/app`**: Contains the main application files, including the layout and the main page.
- **`/components/ui`**: Contains the reusable UI components used throughout the application.
- **`/lib`**: Contains the list of famous libraries.
- **`/public`**: Contains the static assets of the application.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.