import "./globals.css";

export const metadata = {
  title: "Remember",
  description: "Helping people remember what God has taught them.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
