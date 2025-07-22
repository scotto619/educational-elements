import "@/styles/globals.css";
import useInitAudio from "@/hooks/useInitAudio"; // 👈 adjust path if needed

function MyApp({ Component, pageProps }) {
  useInitAudio(); // 👈 safely adds the click listener for audio resume

  return <Component {...pageProps} />;
}

export default MyApp;
