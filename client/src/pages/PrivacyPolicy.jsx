import LegalPage from "../components/LegalPage";
import { privacyPolicy } from "../config/legal";

export default function PrivacyPolicy() {
  return <LegalPage content={privacyPolicy} />;
}
