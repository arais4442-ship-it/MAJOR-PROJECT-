import './globals.css';
import ClientShell from '../components/ClientShell';

export const metadata = {
  title: 'OceanIQ — Cybertronian ARGO Ocean Data Command',
  description: 'Hybrid Retrieval-First Conversational Interface for ARGO Ocean Data Discovery, Visualization, and Forecasting',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientShell>
          {children}
        </ClientShell>
      </body>
    </html>
  );
}

