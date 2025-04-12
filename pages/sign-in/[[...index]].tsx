import { SignIn } from '@clerk/nextjs';

const SignInPage = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <SignIn />
  </div>
);

export default SignInPage;
