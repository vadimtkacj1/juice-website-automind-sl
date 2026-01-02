import '../styles/globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const metadata = {
  title: 'אתר מיצים טבעיים וטעימים | Juice Website',
  description: 'גלו את מגוון המיצים הטבעיים והבריאים שלנו, עשויים מפירות טריים ואיכותיים. הזמינו עכשיו ותיהנו מטעם מרענן!',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

