import "/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Metadata } from "next";
import Script from "next/script";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <ClerkProvider
        afterSignOutUrl="/sign-in"
        signInUrl="/sign-in"
        signUpUrl="/sign-up"
        appearance={{
          variables: { colorPrimary: "#415285" },
          elements: {
            formButtonPrimary:
              "bg-purple-dark border border-black border-solid hover:bg-white hover:text-black",
            socialButtonsBlockButton:
              "bg-white border-gray-200 hover:bg-transparent hover:border-black text-gray-600 hover:text-black",
            socialButtonsBlockButtonText: "font-semibold",
            formButtonReset:
              "bg-white border border-solid border-gray-200 hover:bg-transparent hover:border-black text-gray-500 hover:text-black",
            membersPageInviteButton:
              "bg-black border border-black border-solid hover:bg-white hover:text-black",
            card: "bg-[#fafafa]",
          },
        }}
      >
        <Component {...pageProps} />
      </ClerkProvider>

      <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-core.min.js" />
      <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/plugins/autoloader/prism-autoloader.min.js" />
    </>
  );
}

export default MyApp;
