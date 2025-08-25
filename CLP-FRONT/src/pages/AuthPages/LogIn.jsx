import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/LogInForm";
import LogInForm from "../../components/auth/LogInForm";

export default function LogIn() {
  return (
    <>
      <PageMeta
        title="React.js SignIn Dashboard | CLP - Next.js Admin Dashboard Template"
        description="This is React.js SignIn Tables Dashboard page for CLP - React.js Tailwind CSS Admin Dashboard Template"
      />
      <AuthLayout>
        <LogInForm />
      </AuthLayout>
    </>
  );
}
