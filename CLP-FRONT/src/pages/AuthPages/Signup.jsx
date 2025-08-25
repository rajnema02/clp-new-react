import SignUpForm from "../../components/auth/SignUpForm";
import SignInForm from "../../components/auth/SignUpForm";
import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";

// import SignInForm from "../../components/auth/SignInForm";

export default function Signup() {
  return (
    <>
      <PageMeta
        title="React.js SignUp Dashboard | CLP - Next.js Admin Dashboard Template"
        description="This is React.js SignUp Tables Dashboard page for CLP - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <SignUpForm/>
      </AuthLayout>
    </>
  );
}
