import "../styles/globals.css";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import AuthWrapper from "../components/AuthWrapper";
import NextNProgress from "nextjs-progressbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

import Head from "next/head";
import { useRouter } from "next/router";
import { StateProvider, useStateProvider } from "../context/StateContext";
import { SocketProvider } from "../context/SocketContext";
import reducer, { initialState } from "../context/StateReducer";

// Component that can access the state context
const AppContent = ({ Component, pageProps, router }) => {
  const [{ showLoginModal, showSignupModal }] = useStateProvider();
  
  return (
    <>
      <Head>
        <link rel="shortcut icon" href="/favicon.ico" />
        <title>TalentHive</title>
      </Head>
      <NextNProgress stopDelayMs={20} />
      <ToastContainer />
      <div className="relative flex flex-col h-screen justify-between">
        <NavBar />
        <div
          className={`${
            router.pathname !== "/" ? "mt-32" : ""
          } mb-auto w-full mx-auto`}
        ></div>
        <div className="mb-auto w-full mx-auto">
          <Component {...pageProps} />
        </div>
        <Footer />
      </div>
      
      {/* Render modals globally */}
      {(showLoginModal || showSignupModal) && (
        <AuthWrapper type={showLoginModal ? "login" : "signup"} />
      )}
    </>
  );
};

export default function App({ Component, pageProps }) {
  const router = useRouter();
  return (
    <StateProvider initialState={initialState} reducer={reducer}>
      <SocketProvider>
        <AppContent Component={Component} pageProps={pageProps} router={router} />
      </SocketProvider>
    </StateProvider>
  );
}
