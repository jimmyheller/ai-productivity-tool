//pages/sign-in/[...index].tsx
import { SignIn } from '@clerk/nextjs';
import Footer from '@/components/Footer';

const SignInPage = () => (
  <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="flex-1 flex items-center justify-center">
      <SignIn />
    </div>
    <Footer />
  </div>
);

export default SignInPage;
