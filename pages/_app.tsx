import '@/styles/globals.css';
import { Toaster } from '@/components/ui/toaster';

export default function App({ Component, pageProps }: any) {
    return (
        <>
            <Component {...pageProps} />
            <Toaster />
        </>
    );
}
