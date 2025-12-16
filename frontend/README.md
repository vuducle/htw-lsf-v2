This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Registration Flow

- Route: `/register` implements user registration using ShadCN UI components.
- API: `POST http://localhost:2808/auth/signup` with `{ firstName, lastName, email, password }`.
- Client validation: Uses `zod` to validate inputs and ensure `confirmPassword` matches `password`.
- Success: Shows a toast and redirects to `/`.

### Axios Configuration

- Centralized Axios instance at `lib/axios.ts` with `baseURL` from `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:2808`).
- Import and use: `import api from "@/lib/axios";` then `api.post("/auth/signup", data)`.

### Toasts (react-toastify)

- The toast container is mounted globally in `app/layout.tsx` via `ClientToast`.
- Use the hook `useToastify` from `hooks/useToastify.ts`:

```ts
const toast = useToastify();
toast.success("Saved!");
toast.error({ message: "Oops", options: { autoClose: 5000 } });
```

### Environment

- Optionally set `NEXT_PUBLIC_API_BASE_URL` to point the frontend to a different server.

### Install Dependencies

```bash
cd frontend
npm install
# If not already installed locally
npm install react-toastify
```
