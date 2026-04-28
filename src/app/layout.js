import "./globals.css";

export const metadata = {
  title: "Dedication Reviews",
  description: "AI A&R panel for independent artists",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
