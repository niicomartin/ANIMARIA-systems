import "./globals.css";

import Sidebar from "./components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Sidebar />

        <div className="w-full">{children}</div>
      </body>
    </html>
  );
}
