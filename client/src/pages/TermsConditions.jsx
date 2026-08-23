import LegalPage from "../components/LegalPage";
import { termsConditions } from "../config/legal";

export default function TermsConditions() {
  return <LegalPage content={termsConditions} />;
}
