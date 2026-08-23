import LegalPage from "../components/LegalPage";
import { disclaimer } from "../config/legal";

export default function Disclaimer() {
  return <LegalPage content={disclaimer} />;
}
