// pages/sign-up/[...index].tsx
import { SignUp } from '@clerk/nextjs';
import Footer from '@/components/Footer';

const SignUpPage = () => (
  <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div className="flex-1 flex items-center justify-center">
      <SignUp />
    </div>
    <Footer />
  </div>
);

export default SignUpPage;
